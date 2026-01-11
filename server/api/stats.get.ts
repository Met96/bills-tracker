import { getYearlyStats } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const year = query.year ? parseInt(query.year as string) : new Date().getFullYear()

    const stats = await getYearlyStats(year)

    return {
      success: true,
      year,
      stats: {
        energyTotalCost: stats.energyTotalCost,
        energyTotalConsumed: stats.energyTotalConsumed,
        energyBillCount: stats.energyBillCount,
        gasTotalCost: stats.gasTotalCost,
        gasTotalConsumed: stats.gasTotalConsumed,
        gasBillCount: stats.gasBillCount,
        combinedTotalCost: stats.combinedTotalCost,
      },
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Failed to fetch statistics',
    })
  }
})
