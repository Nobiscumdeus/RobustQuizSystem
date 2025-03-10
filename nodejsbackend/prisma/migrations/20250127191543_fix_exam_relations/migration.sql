/*
  Warnings:

  - You are about to drop the `_ExamToStudent` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `examinerId` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Made the column `code` on table `Course` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "_ExamToStudent" DROP CONSTRAINT "_ExamToStudent_A_fkey";

-- DropForeignKey
ALTER TABLE "_ExamToStudent" DROP CONSTRAINT "_ExamToStudent_B_fkey";

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "examinerId" INTEGER NOT NULL,
ALTER COLUMN "code" SET NOT NULL;

-- DropTable
DROP TABLE "_ExamToStudent";

-- CreateTable
CREATE TABLE "_ExamStudents" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ExamStudents_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ExamStudents_B_index" ON "_ExamStudents"("B");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_examinerId_fkey" FOREIGN KEY ("examinerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExamStudents" ADD CONSTRAINT "_ExamStudents_A_fkey" FOREIGN KEY ("A") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExamStudents" ADD CONSTRAINT "_ExamStudents_B_fkey" FOREIGN KEY ("B") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
