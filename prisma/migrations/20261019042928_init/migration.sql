-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "heightCm" REAL,
    "weightKg" REAL,
    "age" INTEGER,
    "gender" TEXT,
    "stepGoal" INTEGER NOT NULL DEFAULT 8000,
    "waterGoalMl" INTEGER NOT NULL DEFAULT 2000,
    "sleepGoalH" REAL NOT NULL DEFAULT 8
);

-- CreateTable
CREATE TABLE "DailyLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "steps" INTEGER,
    "sleepHours" REAL,
    "sleepQuality" INTEGER,
    "waterMl" INTEGER NOT NULL DEFAULT 0,
    "heartRate" INTEGER,
    "systolic" INTEGER,
    "diastolic" INTEGER,
    "mood" INTEGER,
    "energy" INTEGER,
    "symptoms" TEXT NOT NULL DEFAULT '[]',
    "note" TEXT,
    CONSTRAINT "DailyLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DailyLog_userId_date_key" ON "DailyLog"("userId", "date");
