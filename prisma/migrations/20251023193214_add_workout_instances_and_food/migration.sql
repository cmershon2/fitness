-- CreateTable
CREATE TABLE "workout_instance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_instance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instance_exercise" (
    "id" TEXT NOT NULL,
    "workoutInstanceId" TEXT NOT NULL,
    "exerciseId" TEXT,
    "exerciseName" TEXT NOT NULL,
    "muscleGroup" TEXT,
    "orderIndex" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "instance_exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_set" (
    "id" TEXT NOT NULL,
    "instanceExerciseId" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "targetReps" INTEGER NOT NULL,
    "actualReps" INTEGER,
    "weight" DOUBLE PRECISION,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercise_set_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "barcode" TEXT,
    "calories" INTEGER NOT NULL,
    "protein" DOUBLE PRECISION,
    "carbs" DOUBLE PRECISION,
    "fat" DOUBLE PRECISION,
    "servingSize" TEXT,
    "servingUnit" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workout_instance_userId_scheduledDate_idx" ON "workout_instance"("userId", "scheduledDate");

-- CreateIndex
CREATE INDEX "workout_instance_userId_status_idx" ON "workout_instance"("userId", "status");

-- CreateIndex
CREATE INDEX "instance_exercise_workoutInstanceId_idx" ON "instance_exercise"("workoutInstanceId");

-- CreateIndex
CREATE INDEX "exercise_set_instanceExerciseId_idx" ON "exercise_set"("instanceExerciseId");

-- CreateIndex
CREATE INDEX "food_userId_idx" ON "food"("userId");

-- CreateIndex
CREATE INDEX "food_barcode_idx" ON "food"("barcode");

-- AddForeignKey
ALTER TABLE "workout_instance" ADD CONSTRAINT "workout_instance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instance_exercise" ADD CONSTRAINT "instance_exercise_workoutInstanceId_fkey" FOREIGN KEY ("workoutInstanceId") REFERENCES "workout_instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_set" ADD CONSTRAINT "exercise_set_instanceExerciseId_fkey" FOREIGN KEY ("instanceExerciseId") REFERENCES "instance_exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food" ADD CONSTRAINT "food_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
