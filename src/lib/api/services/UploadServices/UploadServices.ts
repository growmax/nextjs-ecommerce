import { BasePageUrl } from "../../client";
import { BaseService } from "../BaseService";

// Simple slugify function if slugify package is not available
function slugifyUrl(string = ""): string {
  return string
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

export interface UploadOptions {
  folderName: string;
  fileName: string;
  isPublic?: boolean; // Optional, kept for backward compatibility
  contentType?: string; // Optional, kept for backward compatibility
}

export interface PresignedUrlResponse {
  url: string;
  fields: Record<string, string>;
  Bucket: string;
  region: string;
  key: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
}

export class UploadServices extends BaseService<UploadServices> {
  protected defaultClient = BasePageUrl;

  /**
   * Get presigned URL for S3 upload
   */
  async getPresignedUrl(
    options: UploadOptions
  ): Promise<PresignedUrlResponse> {
    const Bucket = process.env.NEXT_PUBLIC_S3BUCKET || "growmax-dev-app-assets";
    const region = process.env.AWS_S3_REGION || "ap-northeast-1";

    // Generate key and aws://s3 URL format (for backend logging/identification)
    const key =
      options.folderName +
      "/" +
      slugifyUrl((options.fileName || "").replace(/[^\w\d_\-\.]+/gi, ""));

    const response = await this.callWith(
      `/auth/user/Upload`,
      {
        Bucket: Bucket,
        Fields: {
          acl: "public-read",
          key: key,
        },
        region: region,
      },
      {
        method: "POST",
        client: BasePageUrl,
      }
    );

    // Extract data from response - API wraps response in { data: { url, fields } }
    const responseData =
      (response as { data?: { url?: string; fields?: Record<string, string> } }) ||
      (response as { url?: string; fields?: Record<string, string> });

    // Check if response has nested data property
    const presignedData =
      "data" in responseData && responseData.data
        ? responseData.data
        : (responseData as { url?: string; fields?: Record<string, string> });

    if (!presignedData.url || !presignedData.fields) {
      throw new Error("Invalid presigned URL response structure");
    }

    // Extract bucket from fields if available, otherwise use the one we sent
    const bucketFromFields = presignedData.fields.bucket || Bucket;

    return {
      url: presignedData.url,
      fields: presignedData.fields,
      Bucket: bucketFromFields,
      region: region,
      key: key,
    };
  }

  /**
   * Upload file to S3 using presigned URL
   * Returns the S3 URL (Location) of the uploaded file
   */
  async uploadToS3(
    file: File,
    presignedData: PresignedUrlResponse,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ Location: string }> {
    if (!presignedData.fields || typeof presignedData.fields !== "object") {
      throw new Error("Invalid presigned data: fields are missing or invalid");
    }

    const formData = new FormData();

    // Append all fields from presigned POST
    Object.keys(presignedData.fields).forEach((key) => {
      const value = presignedData.fields[key];
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    // Append the file last
    formData.append("file", file);

    // Create axios instance for upload progress tracking
    const axios = (await import("axios")).default;
    const instance = axios.create();

    await instance.post(presignedData.url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
          });
        }
      },
    });

    // Construct S3 URL
    const location = `https://${presignedData.Bucket}.s3.${presignedData.region}.amazonaws.com/${presignedData.key}`;

    return { Location: location };
  }

  /**
   * Complete upload flow: Get presigned URL and upload file
   * This is the main method called by ImageUpload component
   */
  async postUpload(
    file: File,
    options: UploadOptions,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ Location: string; url: string; key: string }> {
    // Generate unique filename with timestamp
    const fileExtension = file.name.split(".").pop() || "";
    const fileNameBase = file.name.replace(/\.[^/.]+$/, "");
    const timestamp = new Date().getTime();
    const uniqueFileName = `${fileNameBase}_${timestamp}.${fileExtension}`;

    // Get presigned URL
    const presignedData = await this.getPresignedUrl({
      ...options,
      fileName: uniqueFileName,
    });

    // Upload to S3
    await this.uploadToS3(file, presignedData, onProgress);

    // Merge url and key to create full S3 URL
    const key = presignedData.fields.key || presignedData.key;
    const mergedUrl = presignedData.url.endsWith("/")
      ? `${presignedData.url}${key}`
      : `${presignedData.url}/${key}`;

    return {
      Location: mergedUrl, // Return merged URL as Location
      url: presignedData.url,
      key: key,
    };
  }
}

export default UploadServices.getInstance();

