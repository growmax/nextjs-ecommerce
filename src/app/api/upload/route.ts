import { slugifyUrl } from "@/lib/utils/product";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * Upload API Route
 * Generates S3 presigned POST URL for file uploads
 * 
 * Following migration rules: Keep API routes for file uploads (needs auth/CORS)
 * Based on buyer-fe: /pages/api/upload.js
 */
export async function POST(request: NextRequest) {
  let url: string | undefined;
  let requestDetails = {};

  try {
    // Check authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { foldername, filename } = body;

    if (!foldername || !filename) {
      return NextResponse.json(
        { error: "foldername and filename are required" },
        { status: 400 }
      );
    }

    // Get S3 configuration from environment variables
    const Bucket = process.env.NEXT_PUBLIC_S3BUCKET;
    const AccessKey = process.env.AWS_S3_ACCESS_KEY;
    const SecretKey = process.env.AWS_S3_SECRET_KEY;
    const region = process.env.AWS_S3_REGION;

    if (!Bucket || !AccessKey || !SecretKey || !region) {
      console.error("S3 configuration missing. Required env vars: NEXT_PUBLIC_S3BUCKET, AWS_S3_ACCESS_KEY, AWS_S3_SECRET_KEY, AWS_S3_REGION");
      return NextResponse.json(
        { error: "S3 configuration not available" },
        { status: 500 }
      );
    }

    // Generate S3 key with sanitized filename (matching buyer-fe: foldername + "/" + slugifyUrl(filename.replace(/[^\w\d_\-\.]+/gi, "")))
    const sanitizedFilename = slugifyUrl(filename.replace(/[^\w\d_\-\.]+/gi, ""));
    const key = `${foldername}/${sanitizedFilename}`;

    // Use AWS S3 URL convention for logging (matching buyer-fe)
    url = `aws://s3/${Bucket}/${key}`;

    // Store request details for debugging (matching buyer-fe structure)
    requestDetails = {
      method: "POST",
      payload: {
        foldername: foldername ? `***${foldername.slice(-10)}` : null,
        filename: filename ? `***${filename.slice(-15)}` : null,
        bucket: Bucket,
        region,
        operation: "createPresignedPost",
        keyPrefix: key ? key.split('/')[0] : null,
        hasAccessKey: !!AccessKey,
        hasSecretKey: !!SecretKey
      },
      headers: {
        "AWS-Operation": "S3:CreatePresignedPost",
        "AWS-Region": region,
        "ACL": "public-read"
      }
    };

    // Dynamically import AWS SDK (only when needed)
    const { S3Client } = await import("@aws-sdk/client-s3");
    const { createPresignedPost } = await import("@aws-sdk/s3-presigned-post");

    // Initialize S3 client
    const s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId: AccessKey,
        secretAccessKey: SecretKey,
      },
    });

    // Create presigned POST (always public-read, matching buyer-fe)
    const Fields: Record<string, string> = {};
    Fields.acl = "public-read";

    const { url: presignedUrl, fields } = await createPresignedPost(s3Client, {
      Fields,
      Key: key,
      Bucket,
    });

    return NextResponse.json({
      url: presignedUrl,
      fields,
      Bucket,
      region,
      key,
    });
  } catch (error: any) {
    // Log error for debugging but preserve original success response behavior (matching buyer-fe)
    console.error("S3 presigned URL API error:", {
      url,
      requestDetails,
      error: error.message || error,
      bucket: process.env.NEXT_PUBLIC_S3BUCKET,
      region: process.env.AWS_S3_REGION
    });

    // Return success even on error to avoid exposing AWS errors (matching buyer-fe behavior)
    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  }
}

