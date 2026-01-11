import { parseBillDocument, extractYearAndMonth } from '~~/server/utils/ai'
import { createOrUpdateBill } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const formData = await readMultipartFormData(event)

    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No file provided',
      })
    }

    const fileField = formData.find((field) => field.name === 'file')
    if (!fileField || !fileField.data) {
      throw createError({
        statusCode: 400,
        statusMessage: 'File field is required',
      })
    }

    const fileName = fileField.filename || 'bill'
    const fileBuffer = fileField.data

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (fileBuffer.length > maxSize) {
      throw createError({
        statusCode: 400,
        statusMessage: `File size exceeds 10MB limit (${(fileBuffer.length / (1024 * 1024)).toFixed(2)}MB)`,
      })
    }

    // Validate file extension
    const fileExtension = fileName.toLowerCase().split('.').pop() || ''
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf']

    if (!validExtensions.includes(fileExtension)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid file type. Please upload JPG, PNG, or PDF (received: .${fileExtension})`,
      })
    }

    // Check if it's a PDF and provide helpful message
    if (fileExtension === 'pdf') {
      throw createError({
        statusCode: 400,
        statusMessage:
          'PDF files cannot be processed directly by the AI image analysis system. ' +
          'Please convert your PDF to an image first: ' +
          '1) Take a photo of the bill, ' +
          '2) Use an online PDF-to-JPG converter (search "PDF to JPG"), ' +
          '3) Open PDF and take a screenshot, or ' +
          '4) Use a free tool like SmallPDF or ILovePDF. ' +
          'Then upload the JPG or PNG image instead.',
      })
    }

    // Validate PDF header if needed (kept for future use)
    const fileHeader = fileBuffer.slice(0, 4).toString('ascii')
    if (fileHeader.startsWith('%PDF')) {
      throw createError({
        statusCode: 400,
        statusMessage:
          'PDF files are not supported for direct AI analysis. ' +
          'Please convert your PDF to JPG or PNG format first. ' +
          'Use an online converter like SmallPDF.com or ILovePDF.com',
      })
    }

    // Convert buffer to base64
    const base64Content = fileBuffer.toString('base64')

    // Parse the document using AI
    const parsedData = await parseBillDocument(base64Content, fileName)

    // Validate parsed data
    if (!parsedData.billType || !parsedData.period || parsedData.cost === undefined || parsedData.consumption === undefined) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Failed to extract required bill information. Please ensure the file is a clear, readable image of a utility bill with visible cost and consumption amounts.',
      })
    }

    // Extract year and month from the period
    const { year, month } = extractYearAndMonth(parsedData.period)

    // Save to database (not confirmed yet)
    const bill = await createOrUpdateBill({
      billType: parsedData.billType,
      period: parsedData.period,
      cost: parsedData.cost,
      consumed: parsedData.consumption,
      unit: parsedData.unit,
      year,
      month,
      notes: parsedData.notes || `Confidence: ${(parsedData.confidence * 100).toFixed(1)}%`,
      confirmed: false,
    })

    return {
      success: true,
      bill: {
        id: bill.id,
        billType: bill.billType,
        period: bill.period,
        cost: bill.cost,
        consumption: bill.consumption,
        unit: bill.unit,
        confidence: parsedData.confidence,
        notes: bill.notes,
        confirmed: bill.confirmed,
      },
      aiParsedData: parsedData,
    }
  } catch (error) {
    console.error('Error parsing bill:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Failed to parse bill',
    })
  }
})
