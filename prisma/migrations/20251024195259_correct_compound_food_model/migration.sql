/*
  Warnings:

  - A unique constraint covering the columns `[foodId]` on the table `compound_food` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "compound_food" DROP CONSTRAINT "compound_food_foodId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "compound_food_foodId_key" ON "compound_food"("foodId");

-- AddForeignKey
ALTER TABLE "compound_food" ADD CONSTRAINT "compound_food_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "food"("id") ON DELETE CASCADE ON UPDATE CASCADE;
