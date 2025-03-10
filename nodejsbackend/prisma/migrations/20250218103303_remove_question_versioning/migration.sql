/*
  Warnings:

  - You are about to drop the column `currentVersion` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the `QuestionVersion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "QuestionVersion" DROP CONSTRAINT "QuestionVersion_questionId_fkey";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "currentVersion";

-- DropTable
DROP TABLE "QuestionVersion";
