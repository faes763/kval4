-- CreateEnum
CREATE TYPE "PrizeType" AS ENUM ('TON_100', 'TON_10', 'TON_5', 'TON_3', 'TON_1', 'FACTORY_PASS', 'NFT_BATTERY_LEGENDARY', 'NFT_BATTERY_RARE', 'NFT_BATTERY_COMMON');

-- CreateTable
CREATE TABLE "BoxUser" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "limit_address" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoxUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoxLimit" (
    "id" SERIAL NOT NULL,
    "box_user_id" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoxLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoxPrize" (
    "id" SERIAL NOT NULL,
    "prize_type" "PrizeType" NOT NULL,
    "winner_address" TEXT,
    "is_claimed" BOOLEAN NOT NULL DEFAULT false,
    "claimed_at" TIMESTAMP(3),
    "tx_hash" TEXT,
    "nft_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoxPrize_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BoxUser_address_key" ON "BoxUser"("address");

-- CreateIndex
CREATE UNIQUE INDEX "BoxUser_limit_address_key" ON "BoxUser"("limit_address");

-- CreateIndex
CREATE INDEX "BoxLimit_box_user_id_idx" ON "BoxLimit"("box_user_id");

-- CreateIndex
CREATE INDEX "BoxPrize_prize_type_idx" ON "BoxPrize"("prize_type");

-- CreateIndex
CREATE INDEX "BoxPrize_winner_address_idx" ON "BoxPrize"("winner_address");

-- CreateIndex
CREATE INDEX "BoxPrize_is_claimed_idx" ON "BoxPrize"("is_claimed");

-- AddForeignKey
ALTER TABLE "BoxLimit" ADD CONSTRAINT "BoxLimit_box_user_id_fkey" FOREIGN KEY ("box_user_id") REFERENCES "BoxUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
