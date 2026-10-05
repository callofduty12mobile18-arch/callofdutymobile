-- AlterTable
ALTER TABLE "users" DROP COLUMN IF EXISTS "email_verification_token",
ADD COLUMN IF EXISTS "email_verification_token_hash" TEXT,
ADD COLUMN IF EXISTS "password_reset_expires_at" TIMESTAMP(3),
ADD COLUMN IF EXISTS "password_reset_token_hash" TEXT;
