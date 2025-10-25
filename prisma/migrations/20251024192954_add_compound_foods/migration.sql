-- CreateTable
CREATE TABLE "compound_food" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "servings" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "foodId" TEXT,

    CONSTRAINT "compound_food_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compound_food_ingredient" (
    "id" TEXT NOT NULL,
    "compoundFoodId" TEXT NOT NULL,
    "ingredientFoodId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compound_food_ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "compound_food_userId_idx" ON "compound_food"("userId");

-- CreateIndex
CREATE INDEX "compound_food_ingredient_compoundFoodId_idx" ON "compound_food_ingredient"("compoundFoodId");

-- CreateIndex
CREATE INDEX "compound_food_ingredient_ingredientFoodId_idx" ON "compound_food_ingredient"("ingredientFoodId");

-- AddForeignKey
ALTER TABLE "compound_food" ADD CONSTRAINT "compound_food_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compound_food" ADD CONSTRAINT "compound_food_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "food"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compound_food_ingredient" ADD CONSTRAINT "compound_food_ingredient_compoundFoodId_fkey" FOREIGN KEY ("compoundFoodId") REFERENCES "compound_food"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compound_food_ingredient" ADD CONSTRAINT "compound_food_ingredient_ingredientFoodId_fkey" FOREIGN KEY ("ingredientFoodId") REFERENCES "food"("id") ON DELETE CASCADE ON UPDATE CASCADE;
