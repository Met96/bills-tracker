import { getPendingBills, getConfirmedBills } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const status = query.status as string || 'pending'
    const year = query.year ? parseInt(query.year as string) : undefined

    let bills

    if (status === 'pending') {
      bills = await getPendingBills()
    } else if (status === 'confirmed') {
      bills = await getConfirmedBills(year)
    } else {
      bills = await getPendingBills()
    }

    return {
      success: true,
      status,
      bills: bills.map((bill) => ({
        id: bill.id,
        billType: bill.billType,
        period: bill.period,
        cost: bill.cost,
        consumption: bill.consumption,
        unit: bill.unit,
        status: bill.confirmed ? 'confirmed' : 'pending',
        notes: bill.notes,
        year: bill.year,
        month: bill.month,
        createdAt: bill.createdAt,
      })),
    }
  } catch (error) {
    console.error('Error fetching bills:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Failed to fetch bills',
    })
  }
})
