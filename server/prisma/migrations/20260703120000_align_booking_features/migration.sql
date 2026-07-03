CREATE TABLE IF NOT EXISTS "Category" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "type" "CategoryType" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Category_name_key" ON "Category"("name");

INSERT INTO "Category" ("name", "type")
VALUES ('INDOOR', 'INDOOR'::"CategoryType"), ('OUTDOOR', 'OUTDOOR'::"CategoryType")
ON CONFLICT ("name") DO NOTHING;

ALTER TABLE "Game" ADD COLUMN IF NOT EXISTS "categoryId" INTEGER;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Game' AND column_name = 'category'
  ) THEN
    EXECUTE '
      UPDATE "Game"
      SET "categoryId" = "Category"."id"
      FROM "Category"
      WHERE "Game"."categoryId" IS NULL
        AND "Category"."type" = COALESCE("Game"."category", ''INDOOR''::"CategoryType")
    ';
  END IF;
END $$;

UPDATE "Game"
SET "categoryId" = (SELECT "id" FROM "Category" WHERE "type" = 'INDOOR'::"CategoryType" LIMIT 1)
WHERE "categoryId" IS NULL;

ALTER TABLE "Game" ALTER COLUMN "categoryId" SET NOT NULL;

ALTER TABLE "Game" DROP COLUMN IF EXISTS "category";
ALTER TABLE "Game" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Game" ADD COLUMN IF NOT EXISTS "headId" INTEGER;
ALTER TABLE "Game" ADD COLUMN IF NOT EXISTS "teamALimit" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Game" ADD COLUMN IF NOT EXISTS "teamBLimit" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Game" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Game" DROP CONSTRAINT IF EXISTS "Game_headId_fkey";
ALTER TABLE "Game" ADD CONSTRAINT "Game_headId_fkey"
FOREIGN KEY ("headId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Game" DROP CONSTRAINT IF EXISTS "Game_categoryId_fkey";
ALTER TABLE "Game" ADD CONSTRAINT "Game_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Booking" DROP COLUMN IF EXISTS "userId";
ALTER TABLE "Booking" DROP COLUMN IF EXISTS "slotTime";
ALTER TABLE "Booking" DROP COLUMN IF EXISTS "team";
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "startTime" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "endTime" TEXT;

UPDATE "Booking"
SET "startTime" = '09:00', "endTime" = '10:00'
WHERE "startTime" IS NULL OR "endTime" IS NULL;

ALTER TABLE "Booking" ALTER COLUMN "startTime" SET NOT NULL;
ALTER TABLE "Booking" ALTER COLUMN "endTime" SET NOT NULL;

DROP INDEX IF EXISTS "Booking_userId_date_slotTime_key";
CREATE UNIQUE INDEX IF NOT EXISTS "Booking_gameId_date_startTime_endTime_key"
ON "Booking"("gameId", "date", "startTime", "endTime");
