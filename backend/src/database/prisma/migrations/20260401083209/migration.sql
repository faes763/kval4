/*
  Warnings:

  - A unique constraint covering the columns `[watch_id]` on the table `TxWatchLog` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TxWatchStatus" ADD VALUE 'SENT';
ALTER TYPE "TxWatchStatus" ADD VALUE 'CONFIRMED';
ALTER TYPE "TxWatchStatus" ADD VALUE 'EXPIRED';
ALTER TYPE "TxWatchStatus" ADD VALUE 'LOST';
ALTER TYPE "TxWatchStatus" ADD VALUE 'UNKNOWN';

-- AlterTable
ALTER TABLE "TxWatchLog" ADD COLUMN     "end_seqno" INTEGER,
ADD COLUMN     "start_seqno" INTEGER,
ADD COLUMN     "timeout_at" TIMESTAMP(3),
ADD COLUMN     "tx_hash" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "watch_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "TxWatchLog_watch_id_key" ON "TxWatchLog"("watch_id");

-- CreateIndex
CREATE INDEX "TxWatchLog_watch_id_idx" ON "TxWatchLog"("watch_id");

-- CreateIndex
CREATE INDEX "TxWatchLog_status_idx" ON "TxWatchLog"("status");
