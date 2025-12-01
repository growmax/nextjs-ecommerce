# UploadServices

Service for uploading files to AWS S3 using presigned URLs.

## Overview

This service provides functionality to upload files to S3 by first obtaining a presigned URL from the backend, then uploading the file directly to S3. It handles the complete upload flow including progress tracking and URL generation.

## Class

### `UploadServices`

Extends `BaseService<UploadServices>` and uses `BasePageUrl` for API calls.

## Methods

### `getPresignedUrl`

Gets a presigned URL from the backend for S3 upload.

**Parameters:**

- `options`: `UploadOptions` - Upload configuration
  - `folderName`: `string` - S3 folder path (e.g., "app_assets/company_images/123/logo/456")
  - `fileName`: `string` - Name of the file to upload
  - `isPublic?`: `boolean` - Optional, kept for backward compatibility
  - `contentType?`: `string` - Optional, kept for backward compatibility

**Returns:** `Promise<PresignedUrlResponse>` - Presigned URL data including URL, fields, bucket, region, and key

**Example:**

```typescript
import UploadServices from "@/lib/api/services/UploadServices/UploadServices";

const presignedData = await UploadServices.getPresignedUrl({
  folderName: "app_assets/company_images/123/logo/456",
  fileName: "company-logo.jpg",
});
```

**Response Handling:**

- Handles responses with nested `data` property: `{ data: { url, fields } }`
- Handles responses without nested data: `{ url, fields }`
- Extracts bucket from fields if available, otherwise uses default
- Sanitizes filename by removing special characters
- Throws error if response structure is invalid

**Environment Variables:**

- `NEXT_PUBLIC_S3BUCKET`: S3 bucket name (default: "growmax-dev-app-assets")
- `AWS_S3_REGION`: AWS region (default: "ap-northeast-1")

### `uploadToS3`

Uploads a file to S3 using a presigned URL.

**Parameters:**

- `file`: `File` - The file to upload
- `presignedData`: `PresignedUrlResponse` - Presigned URL data from `getPresignedUrl`
- `onProgress?`: `(progress: UploadProgress) => void` - Optional progress callback

**Returns:** `Promise<{ Location: string }>` - S3 URL of the uploaded file

**Example:**

```typescript
const result = await UploadServices.uploadToS3(
  file,
  presignedData,
  progress => {
    console.log(`Uploaded: ${progress.loaded} / ${progress.total}`);
  }
);
// result.Location = "https://bucket.s3.region.amazonaws.com/key"
```

**Features:**

- Creates FormData with all presigned fields
- Appends file to FormData
- Tracks upload progress via callback
- Constructs final S3 URL from bucket, region, and key
- Validates presigned data structure

### `postUpload`

Complete upload flow: Gets presigned URL and uploads file to S3.

**Parameters:**

- `file`: `File` - The file to upload
- `options`: `UploadOptions` - Upload configuration
- `onProgress?`: `(progress: UploadProgress) => void` - Optional progress callback

**Returns:** `Promise<{ Location: string; url: string; key: string }>` - Upload result with merged URL

**Example:**

```typescript
const result = await UploadServices.postUpload(
  file,
  {
    folderName: "app_assets/company_images/123/logo/456",
    fileName: "company-logo.jpg",
  },
  progress => {
    console.log(`Progress: ${(progress.loaded / progress.total) * 100}%`);
  }
);
// result.Location = Full S3 URL
// result.url = Presigned URL base
// result.key = S3 key
```

**Features:**

- Generates unique filename with timestamp
- Handles files with or without extensions
- Sanitizes special characters in filename
- Merges presigned URL and key to create full S3 URL
- Handles URL with or without trailing slash

## Interfaces

```typescript
interface UploadOptions {
  folderName: string;
  fileName: string;
  isPublic?: boolean;
  contentType?: string;
}

interface PresignedUrlResponse {
  url: string;
  fields: Record<string, string>;
  Bucket: string;
  region: string;
  key: string;
}

interface UploadProgress {
  loaded: number;
  total: number;
}
```

## API Endpoints

- **Get Presigned URL**: `POST /auth/user/Upload`

## Notes

- Uses singleton pattern via `getInstance()`
- Automatically handles request context
- Filenames are sanitized to remove special characters
- Unique filenames are generated with timestamps in `postUpload`
- Progress tracking is optional but recommended for large files
- Handles both nested and flat response structures from API

## Error Handling

- Throws error if presigned URL response structure is invalid
- Throws error if presigned data fields are missing or invalid
- Propagates errors from API calls and S3 uploads

## Testing

See `UploadServices.test.ts` for comprehensive test cases covering:

- API calls with correct parameters
- Response structure handling (nested and flat)
- Invalid response handling
- Error handling
- File upload with progress tracking
- Filename sanitization
- Unique filename generation
- URL merging logic
- Edge cases (missing extensions, special characters, etc.)

Mocks are available in `UploadServices.mocks.ts`.

## Folder Structure

```
services/
  UploadServices/
    UploadServices.ts
    UploadServices.test.ts
    UploadServices.mocks.ts
    README.md
```

## Dependencies

- `BaseService`: Base service class
- `BasePageUrl`: Default API client
- `axios`: HTTP client for S3 uploads
- Custom `slugifyUrl`: Utility for filename sanitization (implemented inline)

## Related

- Base: `BaseService` - Base service implementation
- Client: `BasePageUrl` - Base page API client
- Component: `ImageUpload` - Component that uses this service
