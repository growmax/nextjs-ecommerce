"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, Upload } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

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
}: ImageUploadProps) {
  const [_isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-20 h-20 sm:w-28 sm:h-28",
    lg: "w-32 h-32",
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setError("");
    setIsLoading(true);

    // Create preview URL
    const url = URL.createObjectURL(file);
    onImageChange(url);

    setIsLoading(false);
  };

  if (shape === "circle") {
    return (
      <div className={cn("flex flex-col items-center gap-2", className)}>
        <Avatar
          className={cn(
            sizeClasses[size],
            "cursor-pointer hover:opacity-80 transition-opacity"
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
          <label
            htmlFor="image-upload"
            className="absolute inset-0 cursor-pointer"
          />
        </Avatar>

        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          asChild
          disabled={disabled}
        >
          <label htmlFor="image-upload" className="cursor-pointer">
            <Upload className="h-4 w-4" />
            Upload Photo
          </label>
        </Button>

        <input
          id="image-upload"
          type="file"
          accept={acceptedTypes}
          onChange={handleImageUpload}
          className="hidden"
          disabled={disabled}
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
      <label htmlFor="image-upload" className="cursor-pointer block">
        <div
          className={cn(
            sizeClasses[size],
            "rounded-lg bg-white flex items-center justify-center relative overflow-hidden border border-gray-200 hover:bg-accent/50 transition-colors shadow-sm cursor-pointer",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {currentImage ? (
            <Image
              src={currentImage}
              alt={alt}
              width={112}
              height={112}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="flex items-center justify-center">
              <Plus className="w-8 h-8 sm:w-9 sm:h-9 text-gray-400" />
            </div>
          )}
        </div>
      </label>

      <input
        id="image-upload"
        type="file"
        accept={acceptedTypes}
        onChange={handleImageUpload}
        className="hidden"
        disabled={disabled}
      />

      <p className="text-xs text-muted-foreground text-center">
        JPG, PNG up to {maxSizeMB}MB
      </p>

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
    </div>
  );
}
