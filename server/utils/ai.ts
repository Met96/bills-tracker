import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

const anthropic = new Anthropic()

const BillParsingSchema = z.object({
  billType: z.enum(['energy', 'gas']).describe('Type of bill: energy (electricity) or gas'),
  period: z.string().describe('Billing period, e.g., "January 2024" or "2024-01"'),
  cost: z.number().positive().describe('Total cost in currency units'),
  consumption: z.number().positive().describe('Amount consumed (kW for energy, m³ for gas)'),
  unit: z.enum(['kW', 'm³']).describe('Unit of consumption'),
  confidence: z.number().min(0).max(1).describe('Confidence score of the extraction (0-1)'),
  notes: z.string().optional().describe('Any additional notes or observations from the bill'),
})

export type BillParsingResult = z.infer<typeof BillParsingSchema>

// Detect MIME type from base64 or filename
function detectMimeType(base64: string, fileName: string): 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' {
  // Check base64 header first
  if (base64.startsWith('/9j/')) return 'image/jpeg'
  if (base64.startsWith('iVBORw0KGgo')) return 'image/png'
  if (base64.startsWith('R0lGOD')) return 'image/gif'
  if (base64.startsWith('UklGR')) return 'image/webp'

  // Fallback to filename extension
  const ext = fileName.toLowerCase().split('.').pop()
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'gif':
      return 'image/gif'
    case 'webp':
      return 'image/webp'
    default:
      return 'image/jpeg' // Default fallback
  }
}

export async function parseBillDocument(imageBase64: string, fileName: string): Promise<BillParsingResult> {
  try {
    const mediaType = detectMimeType(imageBase64, fileName)

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      system: `You are an expert at parsing utility bills (electricity/energy and gas bills).
Extract precise information from the bill document image.
Look for:
- The utility company name (to determine bill type: energy or gas)
- The billing period (dates or month/year)
- The total amount due or cost
- The consumption amount (in kW for electricity, m³ for gas)

You MUST respond with a valid JSON object matching this exact structure:
{
  "billType": "energy" or "gas",
  "period": "string with billing period",
  "cost": number (positive),
  "consumption": number (positive),
  "unit": "kW" or "m³",
  "confidence": number between 0 and 1,
  "notes": "optional string with additional notes"
}

Respond ONLY with the JSON object, no other text.`,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: `Please analyze this utility bill image and extract the following information:
1. Bill type (energy/electricity or gas)
2. Billing period (month and year, or date range)
3. Total cost (in the currency shown on the bill)
4. Total consumption (in kW for energy bills or m³ for gas bills)
5. Confidence level of your extraction (0-1, where 1 is very confident)
6. Any additional notes (discounts, special charges, etc.)

Be precise and accurate. Extract exact numbers from the bill.
If you cannot determine a value with confidence, set confidence lower and note the issue.

File name: ${fileName}

Respond with a JSON object only.`,
            },
          ],
        },
      ],
    })

    // Extract text content from response
    const textContent = response.content.find(block => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from AI')
    }

    // Parse the JSON response
    const jsonText = textContent.text.trim()
    // Handle potential markdown code blocks
    const cleanJson = jsonText.replace(/^```json?\n?|\n?```$/g, '').trim()
    const parsed = JSON.parse(cleanJson)

    // Validate with Zod schema
    const result = BillParsingSchema.parse(parsed)
    return result
  } catch (error) {
    console.error('Error parsing bill document:', JSON.stringify(error))

    // Check if it's our PDF error
    if (error instanceof Error && error.message.includes('PDF files are not supported')) {
      throw new Error(error.message)
    }

    // Check for API MIME type validation errors
    if (error instanceof Error && error.message.includes('media_type')) {
      throw new Error(
        'Unsupported file format for AI analysis. ' +
        'Please use JPG or PNG image files. ' +
        'If you have a PDF, convert it to an image first using an online converter or by taking a screenshot.'
      )
    }

    // Check for model errors
    if (error instanceof Error && (error.message.includes('model') || error.message.includes('claude'))) {
      throw new Error(
        'AI service error: The language model is temporarily unavailable. Please try again in a few moments. ' +
        'Make sure your Anthropic API key is valid and has access to Claude models.'
      )
    }

    throw new Error(`Failed to parse bill document: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export function extractYearAndMonth(period: string): { year: number; month?: number } {
  // Try to parse various date formats
  const patterns = [
    { regex: /(\d{4})-(\d{1,2})/, yearIndex: 1, monthIndex: 2 }, // 2024-01
    { regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/, yearIndex: 3, monthIndex: 1 }, // 01/01/2024
    { regex: /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i, yearIndex: 2, monthIndex: 1 }, // January 2024
  ]

  const months: Record<string, number> = {
    january: 1,
    february: 2,
    march: 3,
    april: 4,
    may: 5,
    june: 6,
    july: 7,
    august: 8,
    september: 9,
    october: 10,
    november: 11,
    december: 12,
  }

  for (const pattern of patterns) {
    const match = period.match(pattern.regex)
    if (match) {
      const year = parseInt(match[pattern.yearIndex] || '', 10)
      let month: number | undefined

      if (pattern.monthIndex && match[pattern.monthIndex]) {
        const monthValue = match[pattern.monthIndex]
        month = isNaN(parseInt(monthValue, 10)) ? months[monthValue.toLowerCase()] : parseInt(monthValue, 10)
      }

      return { year, month }
    }
  }

  // Fallback: try to find any 4-digit year
  const yearMatch = period.match(/(\d{4})/)
  if (yearMatch && yearMatch[1]) {
    return { year: parseInt(yearMatch[1], 10) }
  }

  // Default to current year if parsing fails
  return { year: new Date().getFullYear() }
}
