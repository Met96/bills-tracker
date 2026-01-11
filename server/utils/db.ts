import { PrismaClient, type Bill, type YearlyStats } from '@prisma/client'

declare global {

  var prisma: PrismaClient | undefined
}

const prisma =
  global.prisma ||
  (() => {
    const client = new PrismaClient()
    if (process.env.NODE_ENV !== 'production') {
      global.prisma = client
    }
    return client
  })()

export default prisma

export async function getOrCreateYearlyStats(year: number): Promise<YearlyStats> {
  let stats = await prisma.yearlyStats.findUnique({
    where: { year },
  })

  if (!stats) {
    stats = await prisma.yearlyStats.create({
      data: { year },
    })
  }

  return stats
}

export async function updateYearlyStats(year: number): Promise<YearlyStats> {
  // Get all confirmed bills for this year
  const energyBills = await prisma.bill.findMany({
    where: {
      year,
      billType: 'energy',
      confirmed: true,
    },
  })

  const gasBills = await prisma.bill.findMany({
    where: {
      year,
      billType: 'gas',
      confirmed: true,
    },
  })

  const energyTotalCost = energyBills.reduce((sum: number, bill: Bill) => sum + bill.cost, 0)
  const energyTotalConsumed = energyBills.reduce((sum: number, bill: Bill) => sum + bill.consumption, 0)

  const gasTotalCost = gasBills.reduce((sum: number, bill: Bill) => sum + bill.cost, 0)
  const gasTotalConsumed = gasBills.reduce((sum: number, bill: Bill) => sum + bill.consumption, 0)

  const combinedTotalCost = energyTotalCost + gasTotalCost

  const stats = await getOrCreateYearlyStats(year)

  return prisma.yearlyStats.update({
    where: { id: stats.id },
    data: {
      energyTotalCost,
      energyTotalConsumed,
      energyBillCount: energyBills.length,
      gasTotalCost,
      gasTotalConsumed,
      gasBillCount: gasBills.length,
      combinedTotalCost,
    },
  })
}

interface CreateOrUpdateBillInput {
  billType: string
  period: string
  cost: number
  consumed: number
  unit: string
  year: number
  month?: number
  notes?: string
  confirmed?: boolean
}

export async function createOrUpdateBill(billData: CreateOrUpdateBillInput): Promise<Bill> {
  const bill = await prisma.bill.create({
    data: {
      billType: billData.billType,
      period: billData.period,
      cost: billData.cost,
      consumption: billData.consumed,
      unit: billData.unit,
      year: billData.year,
      month: billData.month,
      notes: billData.notes,
      confirmed: billData.confirmed ?? false,
    },
  })

  if (billData.confirmed) {
    await updateYearlyStats(billData.year)
  }

  return bill
}

export async function confirmBill(billId: string): Promise<Bill> {
  const bill = await prisma.bill.findUnique({
    where: { id: billId },
  })

  if (!bill) {
    throw new Error('Bill not found')
  }

  const updatedBill = await prisma.bill.update({
    where: { id: billId },
    data: {
      confirmed: true,
    },
  })

  // Update yearly stats
  await updateYearlyStats(bill.year)

  return updatedBill
}

export async function getYearlyStats(year: number): Promise<YearlyStats> {
  let stats = await prisma.yearlyStats.findUnique({
    where: { year },
  })

  if (!stats) {
    stats = await prisma.yearlyStats.create({
      data: { year },
    })
  }

  return stats
}

export async function getPendingBills(): Promise<Bill[]> {
  return await prisma.bill.findMany({
    where: { confirmed: false },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getConfirmedBills(year?: number): Promise<Bill[]> {
  return await prisma.bill.findMany({
    where: {
      confirmed: true,
      ...(year && { year }),
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function deleteBill(billId: string): Promise<void> {
  const bill = await prisma.bill.findUnique({
    where: { id: billId },
  })

  if (!bill) {
    throw new Error('Bill not found')
  }

  // Delete the bill
  await prisma.bill.delete({
    where: { id: billId },
  })

  // If bill was confirmed, update yearly stats
  if (bill.confirmed) {
    await updateYearlyStats(bill.year)
  }
}
