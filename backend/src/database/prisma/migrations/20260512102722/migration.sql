/*
  Warnings:

  - You are about to drop the `BoxLimit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BoxPrize` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BoxUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TxWatchLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BoxLimit" DROP CONSTRAINT "BoxLimit_box_user_id_fkey";

-- DropTable
DROP TABLE "BoxLimit";

-- DropTable
DROP TABLE "BoxPrize";

-- DropTable
DROP TABLE "BoxUser";

-- DropTable
DROP TABLE "TxWatchLog";

-- DropEnum
DROP TYPE "PrizeType";

-- DropEnum
DROP TYPE "TxWatchStatus";
