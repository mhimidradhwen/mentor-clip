-- AlterTable
ALTER TABLE "public"."video_note" ADD COLUMN     "score" INTEGER;

-- CreateTable
CREATE TABLE "public"."challenge" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."video_submission" (
    "id" TEXT NOT NULL,
    "isFinal" BOOLEAN NOT NULL DEFAULT false,
    "challengeId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_submission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "video_submission_videoId_key" ON "public"."video_submission"("videoId");

-- CreateIndex
CREATE UNIQUE INDEX "video_submission_challengeId_videoId_key" ON "public"."video_submission"("challengeId", "videoId");

-- AddForeignKey
ALTER TABLE "public"."challenge" ADD CONSTRAINT "challenge_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."video_submission" ADD CONSTRAINT "video_submission_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "public"."challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."video_submission" ADD CONSTRAINT "video_submission_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "public"."video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
