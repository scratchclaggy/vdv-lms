-- CreateEnum
CREATE TYPE "ConsultationStatus" AS ENUM ('PENDING', 'COMPLETED');

-- AlterTable
ALTER TABLE "Consultation" ADD COLUMN     "status" "ConsultationStatus" NOT NULL DEFAULT 'PENDING';
