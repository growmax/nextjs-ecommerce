import { NextRequest, NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { cookies } from "next/headers";

const Bucket = process.env.NEXT_PUBLIC_S3BUCKET;
const AccessKey = process.env.AWS_S3_ACCESS_KEY;
const SecretKey = process.env.AWS_S3_SECRET_KEY;
const region = process.env.AWS_S3_REGION;

/**
 * POST /api/delete
 * Delete file from S3
 * Migrated from buyer-fe/pages/api/delete.js
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const token =
      cookieStore.get("access_token")?.value ||
      cookieStore.get("access_token_client")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { filename } = await request.json();

    if (!filename) {
      return NextResponse.json(
        { error: "filename is required" },
        { status: 400 }
      );
    }

    // Initialize S3 client
    if (!region || !AccessKey || !SecretKey) {
      return NextResponse.json(
        { error: "S3 configuration is missing" },
        { status: 500 }
      );
    }

    const s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId: AccessKey,
        secretAccessKey: SecretKey,
      },
    });

    // Delete object from S3
    const deleteCommand = new DeleteObjectCommand({
      Bucket: Bucket || "",
      Key: filename,
    });

    await s3Client.send(deleteCommand);

    return NextResponse.json({ message: "deleted" });
  } catch (error) {
    console.error("S3 delete API error:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
