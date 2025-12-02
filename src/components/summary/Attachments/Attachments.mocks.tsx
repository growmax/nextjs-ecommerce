/**
 * Mock data and utilities for Attachments component tests
 */

import { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";

// Mock user data
export const mockUser = {
  userId: 123,
  displayName: "Test User",
  email: "test@example.com",
};

// Mock form values
export const mockFormValues = {
  comment: "",
  uploadedDocumentDetails: [],
  uploading: false,
  orderIdentifier: "ORDER-123",
  quotationIdentifier: "QUOTE-456",
};

// Mock attachment data
export const mockAttachment = {
  fromMessage: false,
  type: "pdf",
  name: "test-document.pdf",
  width: "Test User,2024-01-01T00:00:00.000Z",
  source: "https://bucket.s3.region.amazonaws.com/app_assets/Quote/test-document.pdf",
  new: true,
  attachment: "https://bucket.s3.region.amazonaws.com/app_assets/Quote/test-document.pdf",
  attachmentType: "pdf",
  filePath: "https://bucket.s3.region.amazonaws.com/app_assets/Quote/test-document.pdf",
};

export const mockAttachments = [mockAttachment];

// Mock file for upload
export const createMockFile = (
  name: string = "test.pdf",
  size: number = 1024, // 1KB
  type: string = "application/pdf"
): File => {
  const file = new File(["test content"], name, { type });
  Object.defineProperty(file, "size", {
    writable: false,
    value: size,
  });
  return file;
};

// Mock upload result
export const mockUploadResult = {
  Location: "https://bucket.s3.region.amazonaws.com/app_assets/Quote/test-document.pdf",
  url: "https://bucket.s3.region.amazonaws.com",
  key: "app_assets/Quote/test-document.pdf",
};

// Form wrapper utility
export function createFormWrapper(defaultValues: any = mockFormValues) {
  return function FormWrapper({ children }: { children: ReactNode }) {
    const methods = useForm({
      defaultValues,
      mode: "onChange",
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
  };
}

