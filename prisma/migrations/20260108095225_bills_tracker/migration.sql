-- CreateTable
CREATE TABLE "Bill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "billType" TEXT NOT NULL,
    "cost" REAL NOT NULL,
    "period" TEXT NOT NULL,
    "consumption" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "billFileName" TEXT,
    "billData" BLOB,
    "year" INTEGER NOT NULL,
    "month" INTEGER
);

-- CreateTable
CREATE TABLE "YearlyStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "year" INTEGER NOT NULL,
    "energyTotalCost" REAL NOT NULL DEFAULT 0,
    "energyTotalConsumed" REAL NOT NULL DEFAULT 0,
    "energyBillCount" INTEGER NOT NULL DEFAULT 0,
    "gasTotalCost" REAL NOT NULL DEFAULT 0,
    "gasTotalConsumed" REAL NOT NULL DEFAULT 0,
    "gasBillCount" INTEGER NOT NULL DEFAULT 0,
    "combinedTotalCost" REAL NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE INDEX "Bill_billType_idx" ON "Bill"("billType");

-- CreateIndex
CREATE INDEX "Bill_year_idx" ON "Bill"("year");

-- CreateIndex
CREATE INDEX "Bill_confirmed_idx" ON "Bill"("confirmed");

-- CreateIndex
CREATE UNIQUE INDEX "YearlyStats_year_key" ON "YearlyStats"("year");
