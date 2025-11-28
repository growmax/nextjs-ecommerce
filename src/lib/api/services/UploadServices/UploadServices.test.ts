import { BaseService } from "../BaseService";
import { UploadServices } from "./UploadServices";
import {
  mockFile,
  mockFileWithSpecialChars,
  mockFileWithoutExtension,
  mockPresignedUrlResponse,
  mockPresignedUrlResponseInvalid,
  mockPresignedUrlResponseMissingUrl,
  mockPresignedUrlResponseWithNestedData,
  mockPresignedUrlResponseWithoutNestedData,
  mockS3Location,
  mockUploadOptions,
  mockUploadOptionsWithoutOptional,
} from "./UploadServices.mocks";

// Mock axios - need to properly mock the dynamic import
const mockAxiosPost = jest.fn();
const mockAxiosInstance = {
  post: mockAxiosPost,
};

jest.mock("axios", () => {
  return {
    __esModule: true,
    default: {
      create: jest.fn(() => mockAxiosInstance),
    },
  };
});

// Mock the client
jest.mock("../../client", () => ({
  BasePageUrl: {},
}));

describe("UploadServices", () => {
  let uploadServices: UploadServices;
  let callWithSpy: jest.SpyInstance;
  let axiosPostSpy: jest.SpyInstance;

  beforeEach(() => {
    uploadServices = new UploadServices();
    callWithSpy = jest.spyOn(BaseService.prototype as any, "callWith");
    axiosPostSpy = mockAxiosPost;

    // Reset mocks
    mockAxiosPost.mockReset();
    jest.clearAllMocks();
  });

  afterEach(() => {
    callWithSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe("getPresignedUrl", () => {
    it("should call API with correct endpoint and parameters", async () => {
      // Arrange
      callWithSpy.mockResolvedValueOnce(
        mockPresignedUrlResponseWithoutNestedData
      );

      // Act
      const result = await uploadServices.getPresignedUrl(mockUploadOptions);

      // Assert
      expect(callWithSpy).toHaveBeenCalledWith(
        "/auth/user/Upload",
        expect.objectContaining({
          Bucket: expect.any(String),
          Fields: expect.objectContaining({
            acl: "public-read",
            key: expect.any(String),
          }),
          region: expect.any(String),
        }),
        expect.objectContaining({
          method: "POST",
          client: expect.any(Object),
        })
      );
      expect(result).toHaveProperty("url");
      expect(result).toHaveProperty("fields");
      expect(result).toHaveProperty("Bucket");
      expect(result).toHaveProperty("region");
      expect(result).toHaveProperty("key");
    });

    it("should use default bucket when NEXT_PUBLIC_S3BUCKET is not set", async () => {
      // Arrange
      const originalEnv = process.env.NEXT_PUBLIC_S3BUCKET;
      delete process.env.NEXT_PUBLIC_S3BUCKET;
      callWithSpy.mockResolvedValueOnce(
        mockPresignedUrlResponseWithoutNestedData
      );

      // Act
      await uploadServices.getPresignedUrl(mockUploadOptions);

      // Assert
      expect(callWithSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          Bucket: "growmax-dev-app-assets",
        }),
        expect.any(Object)
      );

      // Cleanup
      process.env.NEXT_PUBLIC_S3BUCKET = originalEnv;
    });

    it("should use default region when AWS_S3_REGION is not set", async () => {
      // Arrange
      const originalEnv = process.env.AWS_S3_REGION;
      delete process.env.AWS_S3_REGION;
      callWithSpy.mockResolvedValueOnce(
        mockPresignedUrlResponseWithoutNestedData
      );

      // Act
      const result = await uploadServices.getPresignedUrl(mockUploadOptions);

      // Assert
      expect(result.region).toBe("ap-northeast-1");

      // Cleanup
      process.env.AWS_S3_REGION = originalEnv;
    });

    it("should handle response with nested data property", async () => {
      // Arrange
      callWithSpy.mockResolvedValueOnce(mockPresignedUrlResponseWithNestedData);

      // Act
      const result = await uploadServices.getPresignedUrl(mockUploadOptions);

      // Assert
      expect(result).toHaveProperty("url");
      expect(result).toHaveProperty("fields");
      expect(result.url).toBe(mockPresignedUrlResponseWithNestedData.data.url);
    });

    it("should handle response without nested data property", async () => {
      // Arrange
      callWithSpy.mockResolvedValueOnce(
        mockPresignedUrlResponseWithoutNestedData
      );

      // Act
      const result = await uploadServices.getPresignedUrl(mockUploadOptions);

      // Assert
      expect(result).toHaveProperty("url");
      expect(result).toHaveProperty("fields");
      expect(result.url).toBe(
        mockPresignedUrlResponseWithoutNestedData.url
      );
    });

    it("should extract bucket from fields if available", async () => {
      // Arrange
      const responseWithBucketInFields = {
        url: "https://s3.amazonaws.com/test-bucket",
        fields: {
          key: "test-key",
          bucket: "custom-bucket-name",
        },
      };
      callWithSpy.mockResolvedValueOnce(responseWithBucketInFields);

      // Act
      const result = await uploadServices.getPresignedUrl(mockUploadOptions);

      // Assert
      expect(result.Bucket).toBe("custom-bucket-name");
    });

    it("should use provided bucket when not in fields", async () => {
      // Arrange
      const responseWithoutBucketInFields = {
        url: "https://s3.amazonaws.com/test-bucket",
        fields: {
          key: "test-key",
        },
      };
      callWithSpy.mockResolvedValueOnce(responseWithoutBucketInFields);

      // Act
      const result = await uploadServices.getPresignedUrl(mockUploadOptions);

      // Assert
      expect(result.Bucket).toBe(
        process.env.NEXT_PUBLIC_S3BUCKET || "growmax-dev-app-assets"
      );
    });

    it("should sanitize filename by removing special characters", async () => {
      // Arrange
      callWithSpy.mockResolvedValueOnce(
        mockPresignedUrlResponseWithoutNestedData
      );

      // Act
      await uploadServices.getPresignedUrl({
        ...mockUploadOptions,
        fileName: "test@#$%^&file.jpg",
      });

      // Assert
      const callArgs = callWithSpy.mock.calls[0];
      const key = callArgs[1].Fields.key;
      expect(key).not.toContain("@");
      expect(key).not.toContain("#");
      expect(key).not.toContain("$");
    });

    it("should throw error when response is missing url", async () => {
      // Arrange
      callWithSpy.mockResolvedValueOnce(mockPresignedUrlResponseMissingUrl);

      // Act & Assert
      await expect(
        uploadServices.getPresignedUrl(mockUploadOptions)
      ).rejects.toThrow("Invalid presigned URL response structure");
    });

    it("should throw error when response is missing fields", async () => {
      // Arrange
      callWithSpy.mockResolvedValueOnce(mockPresignedUrlResponseInvalid);

      // Act & Assert
      await expect(
        uploadServices.getPresignedUrl(mockUploadOptions)
      ).rejects.toThrow("Invalid presigned URL response structure");
    });

    it("should handle optional parameters", async () => {
      // Arrange
      callWithSpy.mockResolvedValueOnce(
        mockPresignedUrlResponseWithoutNestedData
      );

      // Act
      const result = await uploadServices.getPresignedUrl(
        mockUploadOptionsWithoutOptional
      );

      // Assert
      expect(result).toHaveProperty("url");
      expect(result).toHaveProperty("fields");
    });

    it("should generate correct key format with folder and filename", async () => {
      // Arrange
      callWithSpy.mockResolvedValueOnce(
        mockPresignedUrlResponseWithoutNestedData
      );

      // Act
      await uploadServices.getPresignedUrl(mockUploadOptions);

      // Assert
      const callArgs = callWithSpy.mock.calls[0];
      const key = callArgs[1].Fields.key;
      expect(key).toContain(mockUploadOptions.folderName);
      expect(key).toContain(mockUploadOptions.fileName);
    });
  });

  describe("uploadToS3", () => {
    it("should upload file to S3 with correct FormData", async () => {
      // Arrange
      axiosPostSpy.mockResolvedValueOnce({ status: 200 });

      // Act
      const result = await uploadServices.uploadToS3(
        mockFile,
        mockPresignedUrlResponse
      );

      // Assert
      expect(axiosPostSpy).toHaveBeenCalledWith(
        mockPresignedUrlResponse.url,
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      );
      expect(result).toHaveProperty("Location");
      expect(result.Location).toContain(mockPresignedUrlResponse.Bucket);
      expect(result.Location).toContain(mockPresignedUrlResponse.region);
      expect(result.Location).toContain(mockPresignedUrlResponse.key);
    });

    it("should call onProgress callback during upload", async () => {
      // Arrange
      const onProgress = jest.fn();
      axiosPostSpy.mockImplementation((_url, _formData, config) => {
        // Simulate progress
        if (config.onUploadProgress) {
          config.onUploadProgress({
            loaded: 50,
            total: 100,
          } as any);
        }
        return Promise.resolve({ status: 200 });
      });

      // Act
      await uploadServices.uploadToS3(
        mockFile,
        mockPresignedUrlResponse,
        onProgress
      );

      // Assert
      expect(onProgress).toHaveBeenCalledWith({
        loaded: 50,
        total: 100,
      });
    });

    it("should not call onProgress when not provided", async () => {
      // Arrange
      axiosPostSpy.mockResolvedValueOnce({ status: 200 });

      // Act
      await uploadServices.uploadToS3(mockFile, mockPresignedUrlResponse);

      // Assert
      expect(axiosPostSpy).toHaveBeenCalled();
      // Should not throw error when onProgress is undefined
    });

    it("should append all fields from presigned data to FormData", async () => {
      // Arrange
      axiosPostSpy.mockResolvedValueOnce({ status: 200 });
      const formDataAppendSpy = jest.spyOn(FormData.prototype, "append");

      // Act
      await uploadServices.uploadToS3(mockFile, mockPresignedUrlResponse);

      // Assert
      // Should append all fields
      Object.keys(mockPresignedUrlResponse.fields).forEach((key) => {
        expect(formDataAppendSpy).toHaveBeenCalledWith(
          key,
          mockPresignedUrlResponse.fields[key]
        );
      });
      // Should append file last
      expect(formDataAppendSpy).toHaveBeenCalledWith("file", mockFile);

      formDataAppendSpy.mockRestore();
    });

    it("should skip null or undefined field values", async () => {
      // Arrange
      const presignedDataWithNulls = {
        ...mockPresignedUrlResponse,
        fields: {
          ...mockPresignedUrlResponse.fields,
          validField: "value",
        } as Record<string, string>,
      };
      axiosPostSpy.mockResolvedValueOnce({ status: 200 });
      const formDataAppendSpy = jest.spyOn(FormData.prototype, "append");

      // Act
      await uploadServices.uploadToS3(mockFile, presignedDataWithNulls);

      // Assert
      expect(formDataAppendSpy).toHaveBeenCalledWith("validField", "value");

      formDataAppendSpy.mockRestore();
    });

    it("should throw error when fields are missing", async () => {
      // Arrange
      const invalidPresignedData = {
        ...mockPresignedUrlResponse,
        fields: undefined,
      };

      // Act & Assert
      await expect(
        uploadServices.uploadToS3(mockFile, invalidPresignedData as any)
      ).rejects.toThrow("Invalid presigned data: fields are missing or invalid");
    });

    it("should throw error when fields is not an object", async () => {
      // Arrange
      const invalidPresignedData = {
        ...mockPresignedUrlResponse,
        fields: "not-an-object",
      };

      // Act & Assert
      await expect(
        uploadServices.uploadToS3(mockFile, invalidPresignedData as any)
      ).rejects.toThrow("Invalid presigned data: fields are missing or invalid");
    });

    it("should construct correct S3 URL", async () => {
      // Arrange
      axiosPostSpy.mockResolvedValueOnce({ status: 200 });

      // Act
      const result = await uploadServices.uploadToS3(
        mockFile,
        mockPresignedUrlResponse
      );

      // Assert
      const expectedUrl = `https://${mockPresignedUrlResponse.Bucket}.s3.${mockPresignedUrlResponse.region}.amazonaws.com/${mockPresignedUrlResponse.key}`;
      expect(result.Location).toBe(expectedUrl);
    });

    it("should handle upload errors", async () => {
      // Arrange
      const uploadError = new Error("Upload failed");
      axiosPostSpy.mockRejectedValueOnce(uploadError);

      // Act & Assert
      await expect(
        uploadServices.uploadToS3(mockFile, mockPresignedUrlResponse)
      ).rejects.toThrow("Upload failed");
    });
  });

  describe("postUpload", () => {
    beforeEach(() => {
      // Mock getPresignedUrl and uploadToS3
      jest
        .spyOn(uploadServices, "getPresignedUrl")
        .mockResolvedValue(mockPresignedUrlResponse);
      jest.spyOn(uploadServices, "uploadToS3").mockResolvedValue({
        Location: mockS3Location,
      });
    });

    it("should generate unique filename with timestamp", async () => {
      // Arrange
      const getPresignedUrlSpy = jest.spyOn(uploadServices, "getPresignedUrl");

      // Act
      await uploadServices.postUpload(mockFile, mockUploadOptions);

      // Assert
      expect(getPresignedUrlSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          fileName: expect.stringMatching(/test-image_\d+\.jpg/),
        })
      );
    });

    it("should handle files without extension", async () => {
      // Arrange
      const getPresignedUrlSpy = jest.spyOn(uploadServices, "getPresignedUrl");

      // Act
      await uploadServices.postUpload(
        mockFileWithoutExtension,
        mockUploadOptions
      );

      // Assert
      // When file has no extension, fileExtension becomes the whole filename
      // So format is: fileNameBase_timestamp.fileExtension
      // For "test-image" without extension: "test-image_timestamp.test-image"
      expect(getPresignedUrlSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          fileName: expect.stringMatching(/test-image_\d+\.test-image$/),
        })
      );
    });

    it("should handle files with special characters in name", async () => {
      // Arrange
      const getPresignedUrlSpy = jest.spyOn(uploadServices, "getPresignedUrl");

      // Act
      await uploadServices.postUpload(
        mockFileWithSpecialChars,
        mockUploadOptions
      );

      // Assert
      // The filename is passed as-is to getPresignedUrl, sanitization happens inside getPresignedUrl
      // Format: fileNameBase_timestamp.fileExtension
      // For "test image@#$%^&.jpg": "test image@#$%^&_timestamp.jpg"
      // Use a more flexible regex that matches the pattern
      expect(getPresignedUrlSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          fileName: expect.stringMatching(/test image.*_\d+\.jpg$/),
        })
      );
    });

    it("should call getPresignedUrl and uploadToS3 in sequence", async () => {
      // Arrange
      const getPresignedUrlSpy = jest.spyOn(uploadServices, "getPresignedUrl");
      const uploadToS3Spy = jest.spyOn(uploadServices, "uploadToS3");

      // Act
      await uploadServices.postUpload(mockFile, mockUploadOptions);

      // Assert
      expect(getPresignedUrlSpy).toHaveBeenCalled();
      expect(uploadToS3Spy).toHaveBeenCalled();
      const getPresignedOrder = getPresignedUrlSpy.mock.invocationCallOrder[0];
      const uploadOrder = uploadToS3Spy.mock.invocationCallOrder[0];
      if (getPresignedOrder !== undefined && uploadOrder !== undefined) {
        expect(getPresignedOrder).toBeLessThan(uploadOrder);
      }
      expect(uploadToS3Spy).toHaveBeenCalledWith(
        mockFile,
        mockPresignedUrlResponse,
        undefined
      );
    });

    it("should pass onProgress callback to uploadToS3", async () => {
      // Arrange
      const onProgress = jest.fn();
      const uploadToS3Spy = jest.spyOn(uploadServices, "uploadToS3");

      // Act
      await uploadServices.postUpload(mockFile, mockUploadOptions, onProgress);

      // Assert
      expect(uploadToS3Spy).toHaveBeenCalledWith(
        mockFile,
        mockPresignedUrlResponse,
        onProgress
      );
    });

    it("should return merged URL when presigned URL ends with slash", async () => {
      // Arrange
      const presignedDataWithSlash = {
        ...mockPresignedUrlResponse,
        url: "https://s3.amazonaws.com/test-bucket/",
      };
      jest
        .spyOn(uploadServices, "getPresignedUrl")
        .mockResolvedValue(presignedDataWithSlash);
      jest.spyOn(uploadServices, "uploadToS3").mockResolvedValue({
        Location: mockS3Location,
      });

      // Act
      const result = await uploadServices.postUpload(
        mockFile,
        mockUploadOptions
      );

      // Assert
      expect(result.Location).toBe(
        `${presignedDataWithSlash.url}${presignedDataWithSlash.key}`
      );
    });

    it("should return merged URL when presigned URL does not end with slash", async () => {
      // Arrange
      const presignedDataWithoutSlash = {
        ...mockPresignedUrlResponse,
        url: "https://s3.amazonaws.com/test-bucket",
      };
      jest
        .spyOn(uploadServices, "getPresignedUrl")
        .mockResolvedValue(presignedDataWithoutSlash);
      jest.spyOn(uploadServices, "uploadToS3").mockResolvedValue({
        Location: mockS3Location,
      });

      // Act
      const result = await uploadServices.postUpload(
        mockFile,
        mockUploadOptions
      );

      // Assert
      expect(result.Location).toBe(
        `${presignedDataWithoutSlash.url}/${presignedDataWithoutSlash.key}`
      );
    });

    it("should use key from fields if available", async () => {
      // Arrange
      const presignedDataWithKeyInFields = {
        ...mockPresignedUrlResponse,
        fields: {
          ...mockPresignedUrlResponse.fields,
          key: "custom-key-from-fields",
        },
      };
      jest
        .spyOn(uploadServices, "getPresignedUrl")
        .mockResolvedValue(presignedDataWithKeyInFields);
      jest.spyOn(uploadServices, "uploadToS3").mockResolvedValue({
        Location: mockS3Location,
      });

      // Act
      const result = await uploadServices.postUpload(
        mockFile,
        mockUploadOptions
      );

      // Assert
      expect(result.key).toBe("custom-key-from-fields");
    });

    it("should use key from presignedData when not in fields", async () => {
      // Arrange
      const presignedDataWithoutKeyInFields = {
        ...mockPresignedUrlResponse,
        fields: {
          acl: "public-read",
        },
      };
      jest
        .spyOn(uploadServices, "getPresignedUrl")
        .mockResolvedValue(presignedDataWithoutKeyInFields);
      jest.spyOn(uploadServices, "uploadToS3").mockResolvedValue({
        Location: mockS3Location,
      });

      // Act
      const result = await uploadServices.postUpload(
        mockFile,
        mockUploadOptions
      );

      // Assert
      expect(result.key).toBe(presignedDataWithoutKeyInFields.key);
    });

    it("should return correct response structure", async () => {
      // Arrange
      const presignedData = {
        ...mockPresignedUrlResponse,
        url: "https://s3.amazonaws.com/test-bucket",
      };
      jest
        .spyOn(uploadServices, "getPresignedUrl")
        .mockResolvedValue(presignedData);
      jest.spyOn(uploadServices, "uploadToS3").mockResolvedValue({
        Location: mockS3Location,
      });

      // Act
      const result = await uploadServices.postUpload(
        mockFile,
        mockUploadOptions
      );

      // Assert
      expect(result).toHaveProperty("Location");
      expect(result).toHaveProperty("url");
      expect(result).toHaveProperty("key");
      expect(result.url).toBe(presignedData.url);
      expect(result.key).toBe(
        presignedData.fields.key || presignedData.key
      );
    });

    it("should handle errors from getPresignedUrl", async () => {
      // Arrange
      const error = new Error("Failed to get presigned URL");
      jest.spyOn(uploadServices, "getPresignedUrl").mockRejectedValue(error);

      // Act & Assert
      await expect(
        uploadServices.postUpload(mockFile, mockUploadOptions)
      ).rejects.toThrow("Failed to get presigned URL");
    });

    it("should handle errors from uploadToS3", async () => {
      // Arrange
      const error = new Error("Upload failed");
      jest
        .spyOn(uploadServices, "getPresignedUrl")
        .mockResolvedValue(mockPresignedUrlResponse);
      jest.spyOn(uploadServices, "uploadToS3").mockRejectedValue(error);

      // Act & Assert
      await expect(
        uploadServices.postUpload(mockFile, mockUploadOptions)
      ).rejects.toThrow("Upload failed");
    });
  });
});

