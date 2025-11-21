import axios from "axios";
import { BaseService } from "../BaseService";

export interface PresignedUploadUrlRequest {
  foldername: string;
  filename: string;
}

export interface PresignedUploadUrlResponse {
  url: string;
  fields: Record<string, string>;
  Bucket: string;
  region: string;
  key: string;
}

/**
 * Service for handling file uploads via S3 presigned URLs
 * Migrated from buyer-fe API route pattern
 */
export class UploadService extends BaseService<UploadService> {
  protected defaultClient = axios.create({
    baseURL: typeof window !== "undefined" ? window.location.origin : "",
  });

  /**
   * Get presigned upload URL from API route
   * @param foldername - Folder name in S3 (e.g., "app_assets/summary_attachments")
   * @param filename - Original filename
   * @returns Presigned URL response with fields for S3 upload
   */
  async getPresignedUploadUrl(
    foldername: string,
    filename: string
  ): Promise<PresignedUploadUrlResponse> {
    const response = await this.defaultClient.post<PresignedUploadUrlResponse>(
      "/api/upload",
      {
        foldername,
        filename,
      }
    );

    return response.data;
  }
}

export default UploadService.getInstance();

