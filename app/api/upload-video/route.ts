import {z} from "zod";
import {NextResponse} from "next/server";
import {PutObjectCommand} from "@aws-sdk/client-s3";
import {v4 as uuidv4} from "uuid";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {S3} from "@/lib/s3Client"; // Ensure this path is correct

// Zod schema for validating the request body
export const fileUploadSchema = z.object({
    fileName: z.string().min(1, { message: "Filename is required" }),
    contentType: z.string().min(1, { message: "Content type is required" }),
    size: z.number().min(1, { message: "Size is required" }),
    isImage: z.boolean(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validation = fileUploadSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Invalid request body", details: validation.error.issues },
                { status: 400 }
            );
        }

        const {fileName, contentType, size} = validation.data;

        // Use a 'videos' prefix to organize uploads in S3
        const filePrefix = "videos";
        // Generate a unique key for the S3 object
        const uniqueKey = `${filePrefix}/${uuidv4()}-${fileName.replace(/\s/g, '_')}`;

        const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_IMAGE_NAME;
        if (!bucketName) {
            console.error("S3 Bucket name is not configured.");
            return NextResponse.json({ error: "Server configuration error: Missing S3 bucket name" }, { status: 500 });
        }

        // Create the command for S3 PutObject
        const command = new PutObjectCommand({
            Bucket: bucketName,
            ContentType: contentType,
            ContentLength: size,
            Key: uniqueKey
        })

        // Generate the presigned URL with 30 minutes expiration (1800 seconds)
        const presignedUrl = await getSignedUrl(S3, command, {
            expiresIn: 1800, // 30 minutes is good for large video files
        });

        const response = {
            presignedUrl: presignedUrl,
            key: uniqueKey,
        };

        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("Error generating presigned URL:", error);
        return NextResponse.json({
            error: "Failed to generate presigned URL. Check server logs."
        }, { status: 500 });
    }
}