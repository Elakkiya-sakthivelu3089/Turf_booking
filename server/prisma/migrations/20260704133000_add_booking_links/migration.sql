CREATE TABLE IF NOT EXISTS "BookingLink" (
  "id" SERIAL PRIMARY KEY,
  "token" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "BookingLink_token_key" ON "BookingLink"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "BookingLink_date_key" ON "BookingLink"("date");
