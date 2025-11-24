/**
 * UploadService
 * 
 * Service for handling file uploads to S3
 * Provides helper methods for upload operations
 */

import { slugifyUrl } from "@/lib/utils/product";
import { coreCommerceClient } from "../client";
import { BaseService } from "./BaseService";

interface PresignedUrlResponse {
    url: string;
    fields: Record<string, string>;
    Bucket: string;
    region: string;
    key: string;
}

interface UploadOptions {
    folderName: string;
    fileName: string;
    isPublic?: boolean; // Optional, kept for backward compatibility
    contentType?: string; // Optional, kept for backward compatibility
}

interface UploadProgress {
    loaded: number;
    total: number;
}

export class UploadService extends BaseService<UploadService> {
    // Use coreCommerceClient for backend service calls
    protected defaultClient = coreCommerceClient;

    /**
     * Static method to get presigned URL (delegates to instance)
     */
    static async getPresignedUrl(
        options: UploadOptions
    ): Promise<PresignedUrlResponse> {
        return UploadService.getInstance().getPresignedUrl(options);
    }

    /**
     * Get presigned URL for S3 upload
     */
    async getPresignedUrl(
        options: UploadOptions
    ): Promise<PresignedUrlResponse> {
        const Bucket = process.env.NEXT_PUBLIC_S3BUCKET || "growmax-dev-app-assets";
        const region = process.env.AWS_S3_REGION || "ap-northeast-1";

        // Generate key and aws://s3 URL format (for backend logging/identification)
        const key = options.folderName + "/" + slugifyUrl(options.fileName.replace(/[^\w\d_\-\.]+/gi, ""));
        const awsUrl = `aws://s3/${Bucket}/${key}`;

        // Use fetch directly to bypass axios protocol validation
        // The backend expects aws://s3/... format as the endpoint path
        const baseURL = this.defaultClient.defaults.baseURL || "https://api.myapptino.com/corecommerce";
        const fullUrl = `${baseURL}/${awsUrl}`;

        // Get auth token from cookies (matching client behavior)
        let authToken: string | null = null;
        if (typeof window !== "undefined") {
            const getCookie = (name: string) => {
                const value = `; ${document.cookie}`;
                const parts = value.split(`; ${name}=`);
                if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
                return null;
            };
            authToken = getCookie("access_token_client") || getCookie("access_token");
        }

        const response = await fetch(fullUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "AWS-Operation": "S3:CreatePresignedPost",
                "AWS-Region": region,
                "ACL": "public-read",
                ...(authToken && { Authorization: `Bearer ${authToken}` }),
            },
            credentials: "include",
            body: JSON.stringify({
                foldername: options.folderName,
                filename: options.fileName,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to get presigned URL: ${response.statusText}`);
        }

        return response.json() as Promise<PresignedUrlResponse>;
    }

    /**
     * Static method to upload file to S3 (delegates to instance)
     */
    static async uploadToS3(
        file: File,
        presignedData: PresignedUrlResponse,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<{ Location: string }> {
        return UploadService.getInstance().uploadToS3(file, presignedData, onProgress);
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
        const formData = new FormData();

        // Append all fields from presigned POST
        Object.keys(presignedData.fields).forEach((key) => {
            const value = presignedData.fields[key];
            if (value !== undefined) {
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
     * Static method for complete upload flow (delegates to instance)
     */
    static async uploadFile(
        file: File,
        options: UploadOptions,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<{ Location: string }> {
        return UploadService.getInstance().uploadFile(file, options, onProgress);
    }

    /**
     * Complete upload flow: Get presigned URL and upload file
     */
    async uploadFile(
        file: File,
        options: UploadOptions,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<{ Location: string }> {
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
        return this.uploadToS3(file, presignedData, onProgress);
    }
}

export default UploadService.getInstance();

