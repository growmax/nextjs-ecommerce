// Mocks for UploadServices
// These mocks are for testing the service in isolation.

import type {
  UploadOptions,
  PresignedUrlResponse,
  UploadProgress,
} from "./UploadServices";

export const mockUploadOptions: UploadOptions = {
  folderName: "app_assets/company_images/123/logo/456",
  fileName: "test-image.jpg",
  isPublic: true,
  contentType: "image/jpeg",
};

export const mockUploadOptionsWithoutOptional: UploadOptions = {
  folderName: "app_assets/company_images/123/logo/456",
  fileName: "test-image.jpg",
};

export const mockPresignedUrlResponse: PresignedUrlResponse = {
  url: "https://s3.amazonaws.com/test-bucket",
  fields: {
    key: "app_assets/company_images/123/logo/456/test-image_1234567890.jpg",
    acl: "public-read",
    bucket: "growmax-dev-app-assets",
    "Content-Type": "image/jpeg",
    policy:
      "eyJleHBpcmF0aW9uIjoiMjAyNC0wMS0wMVQwMDowMDowMFoiLCJjb25kaXRpb25zIjpbXX0=",
    "x-amz-algorithm": "AWS4-HMAC-SHA256",
    "x-amz-credential":
      "AKIAIOSFODNN7EXAMPLE/20240101/us-east-1/s3/aws4_request",
    "x-amz-date": "20240101T000000Z",
    "x-amz-signature": "test-signature",
  },
  Bucket: "growmax-dev-app-assets",
  region: "ap-northeast-1",
  key: "app_assets/company_images/123/logo/456/test-image_1234567890.jpg",
};

export const mockPresignedUrlResponseWithNestedData = {
  data: {
    url: "https://s3.amazonaws.com/test-bucket",
    fields: {
      key: "app_assets/company_images/123/logo/456/test-image_1234567890.jpg",
      acl: "public-read",
      bucket: "growmax-dev-app-assets",
    },
  },
};

export const mockPresignedUrlResponseWithoutNestedData = {
  url: "https://s3.amazonaws.com/test-bucket",
  fields: {
    key: "app_assets/company_images/123/logo/456/test-image_1234567890.jpg",
    acl: "public-read",
    bucket: "growmax-dev-app-assets",
  },
};

export const mockPresignedUrlResponseInvalid = {
  url: "https://s3.amazonaws.com/test-bucket",
  // Missing fields
};

export const mockPresignedUrlResponseMissingUrl = {
  fields: {
    key: "app_assets/company_images/123/logo/456/test-image_1234567890.jpg",
    acl: "public-read",
  },
};

export const mockFile = new File(["test content"], "test-image.jpg", {
  type: "image/jpeg",
});

export const mockFileWithSpecialChars = new File(
  ["test content"],
  "test image@#$%^&.jpg",
  {
    type: "image/jpeg",
  }
);

export const mockFileWithoutExtension = new File(["test content"], "test-image", {
  type: "image/jpeg",
});

export const mockUploadProgress: UploadProgress = {
  loaded: 50,
  total: 100,
};

export const mockS3Location =
  "https://growmax-dev-app-assets.s3.ap-northeast-1.amazonaws.com/app_assets/company_images/123/logo/456/test-image_1234567890.jpg";

export const mockPostUploadResponse = {
  Location:
    "https://s3.amazonaws.com/test-bucket/app_assets/company_images/123/logo/456/test-image_1234567890.jpg",
  url: "https://s3.amazonaws.com/test-bucket",
  key: "app_assets/company_images/123/logo/456/test-image_1234567890.jpg",
};

export const mockPostUploadResponseWithTrailingSlash = {
  Location:
    "https://s3.amazonaws.com/test-bucket/app_assets/company_images/123/logo/456/test-image_1234567890.jpg",
  url: "https://s3.amazonaws.com/test-bucket/",
  key: "app_assets/company_images/123/logo/456/test-image_1234567890.jpg",
};

