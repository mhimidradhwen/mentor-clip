-- CreateTable
CREATE TABLE "public"."video_note" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestampMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "videoId" TEXT NOT NULL,
    "supervisorId" TEXT NOT NULL,

    CONSTRAINT "video_note_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."video_note" ADD CONSTRAINT "video_note_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "public"."video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."video_note" ADD CONSTRAINT "video_note_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
