/*
  Warnings:

  - Changed the type of `category` on the `Question` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('SCIENCE', 'ENGINEERING', 'ARTS_HUMANITIES', 'SOCIAL_SCIENCES', 'BUSINESS_MANAGEMENT', 'GEOGRAPHY', 'LAW', 'MEDICAL_HEALTH_SCIENCES', 'EDUCATION', 'AGRICULTURE', 'ENVIRONMENTAL_SCIENCES', 'COMPUTER_SCIENCE_IT', 'ARCHITECTURE', 'PHILOSOPHY', 'LANGUAGES_LINGUISTICS', 'ECONOMICS', 'MATHEMATICS', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'MUSIC');

-- AlterTable

/*
ALTER TABLE "Question" DROP COLUMN "category",
ADD COLUMN     "category" "CategoryType" NOT NULL;
*/

-- AlterTable
ALTER TABLE "Question"
  ALTER COLUMN "category" TYPE "CategoryType" USING "category"::"CategoryType";
