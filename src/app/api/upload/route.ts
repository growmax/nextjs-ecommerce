import { NextRequest, NextResponse } from "next/server";
import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { cookies } from "next/headers";

const Bucket = process.env.NEXT_PUBLIC_S3BUCKET;
const AccessKey = process.env.AWS_S3_ACCESS_KEY;
const SecretKey = process.env.AWS_S3_SECRET_KEY;
const region = process.env.AWS_S3_REGION;

/**
 * POST /api/upload
 * Generate S3 presigned URL for file upload
 * Migrated from buyer-fe/pages/api/upload.js
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value || cookieStore.get("access_token_client")?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { foldername, filename } = await request.json();

    if (!foldername || !filename) {
      return NextResponse.json(
        { error: "foldername and filename are required" },
        { status: 400 }
      );
    }

    // Sanitize filename (similar to buyer-fe slugifyUrl)
    const sanitizedFilename = filename.replace(/[^\w\d_\-\.]+/gi, "");
    const key = `${foldername}/${sanitizedFilename}`;

    const Fields: Record<string, string> = {
      acl: "public-read",
    };

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

    // Generate presigned URL
    const { url: presignedUrl, fields } = await createPresignedPost(s3Client, {
      Fields,
      Key: key,
      Bucket: Bucket || "",
    });

    return NextResponse.json({
      url: presignedUrl,
      fields,
      Bucket,
      region,
      key,
    });
  } catch (error) {
    console.error("S3 presigned URL API error:", error);
    // Return success to avoid exposing AWS errors (matching buyer-fe behavior)
    return NextResponse.json({ success: true });
  }
}

