-- CreateTable
CREATE TABLE "diet_entry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "mealCategory" TEXT NOT NULL,
    "servings" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diet_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "water_entry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'ml',
    "date" DATE NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "water_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_water_goal" (
    "userId" TEXT NOT NULL,
    "dailyGoal" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'ml',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_water_goal_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE INDEX "diet_entry_userId_date_idx" ON "diet_entry"("userId", "date");

-- CreateIndex
CREATE INDEX "diet_entry_foodId_idx" ON "diet_entry"("foodId");

-- CreateIndex
CREATE INDEX "water_entry_userId_date_idx" ON "water_entry"("userId", "date");

-- AddForeignKey
ALTER TABLE "diet_entry" ADD CONSTRAINT "diet_entry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diet_entry" ADD CONSTRAINT "diet_entry_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "food"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "water_entry" ADD CONSTRAINT "water_entry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_water_goal" ADD CONSTRAINT "user_water_goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
