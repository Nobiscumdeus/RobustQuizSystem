-- CreateTable
CREATE TABLE "prisma_user" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "matricNo" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prisma_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prisma_exam" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "creatorId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "timeAllowed" INTEGER NOT NULL,
    "passcode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prisma_exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prisma_question" (
    "id" SERIAL NOT NULL,
    "examId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prisma_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prisma_question_option" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prisma_question_option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prisma_exam_registration" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "examId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "passcode" TEXT,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prisma_exam_registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prisma_result" (
    "id" SERIAL NOT NULL,
    "registrationId" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "gradedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prisma_result_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "prisma_user_username_key" ON "prisma_user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "prisma_user_email_key" ON "prisma_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "prisma_user_matricNo_key" ON "prisma_user"("matricNo");

-- AddForeignKey
ALTER TABLE "prisma_exam" ADD CONSTRAINT "prisma_exam_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "prisma_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prisma_question" ADD CONSTRAINT "prisma_question_examId_fkey" FOREIGN KEY ("examId") REFERENCES "prisma_exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prisma_question_option" ADD CONSTRAINT "prisma_question_option_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "prisma_question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prisma_exam_registration" ADD CONSTRAINT "prisma_exam_registration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "prisma_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prisma_exam_registration" ADD CONSTRAINT "prisma_exam_registration_examId_fkey" FOREIGN KEY ("examId") REFERENCES "prisma_exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prisma_result" ADD CONSTRAINT "prisma_result_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "prisma_exam_registration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
