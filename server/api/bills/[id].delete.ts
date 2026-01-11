import { deleteBill } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const billId = getRouterParam(event, 'id')

    if (!billId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bill ID is required',
      })
    }

    await deleteBill(billId)

    return {
      success: true,
      message: 'Bill deleted successfully',
    }
  } catch (error) {
    console.error('Error deleting bill:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Failed to delete bill',
    })
  }
})
