"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import UploadServices from "@/lib/api/services/UploadServices/UploadServices";
import { cn } from "@/lib/utils";
import { Plus, Upload } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

interface ImageUploadProps {
  currentImage?: string | null;
  onImageChange: (image: string) => void;
  alt?: string;
  size?: "sm" | "md" | "lg";
  shape?: "square" | "circle";
  fallbackText?: string;
  acceptedTypes?: string;
  maxSizeMB?: number;
  disabled?: boolean;
  className?: string;
  folderName?: string | undefined; // S3 folder path (e.g., "app_assets/company_images/123/profile/456")
  onUploadProgress?: (progress: number) => void; // Progress callback (0-100)
  onUploadSuccess?: (imageUrl: string) => void; // Success callback after upload completes
}

export function ImageUpload({
  currentImage,
  onImageChange,
  alt = "Uploaded image",
  size = "md",
  shape = "square",
  fallbackText = "Upload",
  acceptedTypes = "image/*",
  maxSizeMB = 5,
  disabled = false,
  className,
  folderName,
  onUploadProgress,
  onUploadSuccess,
}: ImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-20 h-20 sm:w-28 sm:h-28",
    lg: "w-full max-w-[140px] sm:max-w-[160px] md:max-w-[180px] lg:max-w-[200px] aspect-square",
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const allowedExtensions = ["jpg", "jpeg", "png"];
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      setError("Only JPG, JPEG, and PNG files are allowed!");
      toast.error("Only JPG, JPEG, and PNG files are allowed!");
      return;
    }

    // Validate file size (convert MB to KB for comparison with reference)
    const fileSizeKB = file.size / 1024;
    const maxSizeKB = maxSizeMB * 1024;
    if (fileSizeKB > maxSizeKB) {
      const errorMsg = `Maximum file size of ${maxSizeKB}KB allowed`;
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setError("");
    setIsLoading(true);
    setUploadProgress(0);

    try {
      // If folderName is provided, upload to S3
      if (folderName) {
        // Show preview immediately
        const previewUrl = URL.createObjectURL(file);
        onImageChange(previewUrl);

        // Upload to S3
        const result = await UploadServices.postUpload(
          file,
          {
            folderName,
            fileName: file.name,
            isPublic: false,
            contentType: file.type,
          },
          (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            setUploadProgress(percent);
            onUploadProgress?.(percent);
          }
        );
        
        // Update with merged S3 URL (url + key)
        onImageChange(result.Location);
        // Call success callback if provided (for showing toast notifications)
        if (onUploadSuccess) {
          onUploadSuccess(result.Location);
        } else {
          // Default toast if no callback provided
          toast.success("Image uploaded successfully");
        }
      } else {
        // Fallback: Just create preview URL (existing behavior)
        const url = URL.createObjectURL(file);
        onImageChange(url);
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMsg = error instanceof Error ? error.message : "Failed to upload image";
      setError(errorMsg);
      toast.error(errorMsg);
      // Don't update image on error
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
      // Reset input
      e.target.value = "";
    }
  };

  if (shape === "circle") {
    return (
      <div className={cn("flex flex-col items-center gap-2 w-full", className)}>
        <Avatar
          className={cn(
            sizeClasses[size],
            "cursor-pointer hover:opacity-80 transition-opacity",
            (disabled || isLoading) && "opacity-50 cursor-not-allowed",
            className && !className.includes("w-") && "w-full"
          )}
        >
          <AvatarImage src={currentImage || undefined} alt={alt} />
          <AvatarFallback>
            {currentImage ? (
              fallbackText.charAt(0)
            ) : (
              <Plus className="h-6 w-6" />
            )}
          </AvatarFallback>
          {!disabled && !isLoading && (
            <label
              htmlFor="image-upload"
              className="absolute inset-0 cursor-pointer"
            />
          )}
        </Avatar>

        {isLoading && uploadProgress > 0 && (
          <div className="w-full max-w-[200px]">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-center mt-1">{uploadProgress}%</p>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          asChild
          disabled={disabled || isLoading}
        >
          <label htmlFor="image-upload" className="cursor-pointer">
            <Upload className="h-4 w-4" />
            {isLoading ? "Uploading..." : "Upload Photo"}
          </label>
        </Button>

        <input
          id="image-upload"
          type="file"
          accept={acceptedTypes}
          onChange={handleImageUpload}
          className="hidden"
          disabled={disabled || isLoading}
          onClick={(e) => {
            // Reset input value to allow selecting same file again
            (e.target as HTMLInputElement).value = "";
          }}
        />

        <p className="text-xs text-muted-foreground">
          JPG, PNG up to {maxSizeMB}MB
        </p>

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative w-full">
        <label
          htmlFor="image-upload"
          className={cn(
            "cursor-pointer block w-full",
            (disabled || isLoading) && "cursor-not-allowed"
          )}
        >
          <div
            className={cn(
              sizeClasses[size],
              "rounded-xl bg-white flex items-center justify-center relative overflow-hidden border border-gray-200 hover:bg-accent/50 transition-colors shadow-sm",
              (disabled || isLoading) && "opacity-50 cursor-not-allowed"
            )}
          >
            {currentImage ? (
              <Image
                src={currentImage}
                alt={alt}
                width={112}
                height={112}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="flex items-center justify-center">
                <Plus className="w-8 h-8 sm:w-9 sm:h-9 text-gray-400" />
              </div>
            )}
            {/* Upload overlay icon (similar to reference UploadIcon) */}
            {!disabled && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity rounded-xl">
                <Upload className="w-6 h-6 text-white" />
              </div>
            )}
          </div>
        </label>
        {isLoading && uploadProgress > 0 && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-[120px]">
            <Progress value={uploadProgress} className="h-1.5" />
            <p className="text-xs text-center mt-0.5">{uploadProgress}%</p>
          </div>
        )}
      </div>

      <input
        id="image-upload"
        type="file"
        accept={acceptedTypes}
        onChange={handleImageUpload}
        className="hidden"
        disabled={disabled || isLoading}
        onClick={(e) => {
          // Reset input value to allow selecting same file again
          (e.target as HTMLInputElement).value = "";
        }}
      />

      <p className="text-xs text-muted-foreground text-center">
        JPG, PNG up to {maxSizeMB}MB
      </p>

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
    </div>
  );
}
