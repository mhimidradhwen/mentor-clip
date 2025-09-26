/*
  Warnings:

  - A unique constraint covering the columns `[studentId]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[professionalId]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "class" TEXT,
ADD COLUMN     "professionalId" TEXT,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'student',
ADD COLUMN     "studentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_studentId_key" ON "public"."user"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "user_professionalId_key" ON "public"."user"("professionalId");
