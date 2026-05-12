-- CreateEnum
CREATE TYPE "TxWatchStatus" AS ENUM ('TIMEOUT');

-- CreateTable
CREATE TABLE "TxWatchLog" (
    "id" SERIAL NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "dest_address" TEXT,
    "body_hash" TEXT,
    "status" "TxWatchStatus" NOT NULL DEFAULT 'TIMEOUT',
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TxWatchLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TxWatchLog_wallet_address_idx" ON "TxWatchLog"("wallet_address");

-- CreateIndex
CREATE INDEX "TxWatchLog_dest_address_idx" ON "TxWatchLog"("dest_address");
