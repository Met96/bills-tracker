import { confirmBill } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const billId = getRouterParam(event, 'id')

    if (!billId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bill ID is required',
      })
    }

    const bill = await confirmBill(billId)

    return {
      success: true,
      bill: {
        id: bill.id,
        billType: bill.billType,
        period: bill.period,
        cost: bill.cost,
        consumption: bill.consumption,
        unit: bill.unit,
        status: bill.status,
      },
    }
  } catch (error) {
    console.error('Error confirming bill:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Failed to confirm bill',
    })
  }
})
