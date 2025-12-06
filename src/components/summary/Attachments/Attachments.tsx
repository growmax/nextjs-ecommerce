"use client";

import { Button } from "@/components/ui/button";
import SectionCardDetail from "@/components/custom/SectionCardDetail";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { UploadProgress } from "@/lib/api/services/UploadServices/UploadServices";
import UploadServices from "@/lib/api/services/UploadServices/UploadServices";
import { cn } from "@/lib/utils";
import axios from "axios";
import { isEmpty } from "lodash";
import { Paperclip, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

interface AttachmentsProps {
  showHeader?: boolean;
  showAttachments?: boolean;
  editAttachments?: boolean;
  showComments?: boolean;
  editComments?: boolean;
  fieldName?: string;
  folderName?: string;
  isContentPage?: boolean;
  isOrder?: boolean;
  readOnly?: boolean;
}

/**
 * Attachments component for Comments and File Uploads
 * Migrated from buyer-fe/src/components/Summary/Components/Attachments/Attachments.js
 *
 * Handles comments textarea and file attachment uploads
 */
export default function Attachments({
  showHeader = true,
  showAttachments = true,
  editAttachments = true,
  showComments = false,
  fieldName = "uploadedDocumentDetails",
  folderName = "Quote",
  isContentPage = false,
  isOrder = false,
  readOnly = false,
}: AttachmentsProps) {
  const { watch, setValue } = useFormContext();

  const { user } = useCurrentUser();
  const uploadedDocumentDetails = watch(fieldName) || [];
  const uploading = watch("uploading");

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFileName, setUploadingFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (2MB max)
    const fileSize = file.size / 1024; // in KB
    if (fileSize >= 2000) {
      toast.error("Maximum file size of 2MB allowed");
      return;
    }

    // Validate file type
    const allowedTypes = [
      ".pdf",
      ".doc",
      ".docx",
      ".jpg",
      ".jpeg",
      ".png",
      ".xlsx",
    ];
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      toast.error("Invalid file type. Allowed: PDF, DOC, DOCX, JPG, PNG, XLSX");
      return;
    }

    setValue("uploading", true);
    setUploadingFileName(file.name);
    setUploadProgress(0);
    e.target.value = ""; // Reset input

    try {
      // Use UploadServices.postUpload for complete upload flow
      const uploadResult = await UploadServices.postUpload(
        file,
        {
          folderName: `app_assets/${folderName}`,
          fileName: file.name,
        },
        (progress: UploadProgress) => {
          if (progress.total) {
            const progressPercent = Math.round(
              (progress.loaded / progress.total) * 100
            );
            setUploadProgress(progressPercent);
          }
        }
      );

      // Use the Location from upload result as S3 URL
      const s3Url = uploadResult.Location;
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "";

      // Create attachment object (matching buyer-fe format)
      const newAttachment = {
        fromMessage: false,
        type: fileExt,
        name: file.name,
        width: `${user?.displayName || "User"},${new Date().toISOString()}`,
        source: s3Url,
        new: true,
        attachment: s3Url,
        attachmentType: fileExt,
        filePath: s3Url,
      };

      // Update form state - unshift like buyer-fe
      const currentAttachments = Array.isArray(uploadedDocumentDetails)
        ? uploadedDocumentDetails
        : [];
      const updatedAttachments = [newAttachment, ...currentAttachments];
      setValue(fieldName, updatedAttachments);

      // If content page, save to backend
      if (isContentPage) {
        await postContentPage(updatedAttachments);
      }

      setUploadProgress(0);
      setUploadingFileName("");
      toast.success("Attachments Uploaded successfully");
    } catch (error: any) {
      console.error("File upload error:", error);
      toast.error(error?.message || "Failed to upload file");
      setUploadProgress(0);
      setUploadingFileName("");
    } finally {
      setValue("uploading", false);
    }
  };

  // Post attachments to backend for content pages
  const postContentPage = async (values: any[]) => {
    try {
      if (isOrder) {
        const orderIdentifier = watch("orderIdentifier");
        const body = {
          orderUsers: [],
          deletableOrderUsers: [],
          productDetails: [],
          uploadedDocumentDetails: values,
          orderId: orderIdentifier,
          activeTags: [],
          deletableTags: [],
          buyerReferenceNumber: null,
          customerRequiredDate: null,
        };
        await axios.post("/api/sales/Details/attachmentSave", {
          body,
          userId: user?.userId,
          isOrder: true,
        });
      } else {
        const quotationIdentifier = watch("quotationIdentifier");
        const body = {
          activeQuoteUsers: [],
          deletableQuoteUsers: [],
          quoteId: quotationIdentifier,
          activeTags: [],
          deletableTags: [],
          uploadedDocumentDetails: values,
          productDetails: [],
          buyerReferenceNumber: null,
        };
        await axios.post("/api/sales/Details/attachmentSave", {
          body,
          userId: user?.userId,
          isOrder: false,
        });
      }
    } catch (error) {
      console.error("Error saving attachments:", error);
    }
  };

  // Handle file removal
  const handleFileRemove = async (index: number) => {
    const attachment = uploadedDocumentDetails[index];
    if (!attachment) return;

    try {
      // If attachment has a source URL, try to delete from S3
      if (attachment.source || attachment.filePath) {
        const sourceUrl = attachment.source || attachment.filePath;
        // Extract key from S3 URL
        const urlMatch = sourceUrl.match(/\.s3\.[^/]+\/(.+)$/);
        if (urlMatch && urlMatch[1]) {
          const key = urlMatch[1];
          try {
            // Call delete API
            await axios.post("/api/delete", {
              filename: key,
            });
          } catch (deleteError) {
            console.warn("Failed to delete file from S3:", deleteError);
          }
        }
      }

      // Remove from form state
      const updatedAttachments = uploadedDocumentDetails.filter(
        (_: unknown, i: number) => i !== index
      );
      setValue(fieldName, updatedAttachments);

      // If content page, save to backend
      if (isContentPage) {
        await postContentPage(updatedAttachments);
      }

      toast.success("File removed");
    } catch (error) {
      console.error("File removal error:", error);
      toast.error("Failed to remove file");
    }
  };

  if (!showComments && !showAttachments) {
    return null;
  }

  const cardTitle =
    showComments && showAttachments
      ? "Attachments"
      : showComments
        ? "Comments"
        : "Attachments";

  const headerActions = showAttachments ? (
    <Button
      type="button"
      variant="outline"
      onClick={() => fileInputRef.current?.click()}
      disabled={uploading || !editAttachments}
      className={cn(
        "flex items-center gap-2",
        (uploading || !editAttachments) && "opacity-50 cursor-not-allowed"
      )}
    >
      <Paperclip className="h-4 w-4" />
      {uploading ? `Uploading... ${uploadProgress}%` : "ATTACH"}
    </Button>
  ) : undefined;

  return (
    <SectionCardDetail
      title=""
      headerColor="muted"
      shadow="sm"
      className="mt-4"
      contentClassName="px-6 pt-5 pb-0 mt-0!"
    >
      <div>
        {/* Header content moved to content area */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mb-4">
          <div className="flex flex-col">
            <h3 className="text-xl font-semibold text-gray-900 m-0">
              {cardTitle}
            </h3>
            {showHeader && showAttachments && (
              <p className="text-xs text-muted-foreground mt-1">
                Max 2MB (PDF, DOC, DOCX, JPG, PNG, XLSX)
              </p>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center gap-2">{headerActions}</div>
          )}
        </div>
        {/* First Row: Comments and Attachments side by side */}
        <div className="flex flex-col md:flex-row items-start">
          {/* Attachments Section */}
          {showAttachments && (
            <div className={cn("", showComments && !isContentPage)}>
              <div className="flex items-center justify-between m-0!">
                <div className="flex items-center ">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    id="file-upload"
                    onChange={handleFileUpload}
                    disabled={uploading || !editAttachments}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx"
                  />
                </div>
              </div>

              {/* Upload Progress */}
              {uploading && uploadingFileName && (
                <div className="space-y-1 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate">{uploadingFileName}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-600 transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Second Row: Uploaded Files List (Full Width) */}
        {!isEmpty(uploadedDocumentDetails) && (
          <div className="space-y-2 pt-2 border-t w-full">
            {uploadedDocumentDetails.map((attachment: any, index: number) => {
              // Parse uploader info and date from width field
              // Format: "User Name,ISO_TIMESTAMP"
              let uploaderName = "User";
              let uploadDate = "";
              let uploadTime = "";

              if (attachment.width && typeof attachment.width === "string") {
                const parts = attachment.width.split(",");
                if (parts.length >= 2) {
                  uploaderName = parts[0] || "User";
                  try {
                    const date = new Date(parts.slice(1).join(","));
                    if (!isNaN(date.getTime())) {
                      // Format: DD-MM-YYYY
                      const day = String(date.getDate()).padStart(2, "0");
                      const month = String(date.getMonth() + 1).padStart(
                        2,
                        "0"
                      );
                      const year = date.getFullYear();
                      uploadDate = `${day}-${month}-${year}`;

                      // Format: HH:MM AM/PM
                      const hours = date.getHours();
                      const minutes = String(date.getMinutes()).padStart(
                        2,
                        "0"
                      );
                      const ampm = hours >= 12 ? "PM" : "AM";
                      const displayHours = hours % 12 || 12;
                      uploadTime = `${String(displayHours).padStart(2, "0")}:${minutes} ${ampm}`;
                    }
                  } catch (e) {
                    console.warn("Failed to parse date from attachment:", e);
                  }
                }
              }

              return (
                <div
                  key={index}
                  className="flex items-start justify-between gap-3 py-2"
                >
                  <div
                    className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer"
                    onClick={() => {
                      if (attachment.source || attachment.filePath) {
                        window.open(
                          attachment.source || attachment.filePath,
                          "_blank"
                        );
                      }
                    }}
                  >
                    {/* Circular paperclip icon */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mt-0.5">
                      <Paperclip className="h-4 w-4 text-gray-600" />
                    </div>

                    {/* File info */}
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <div className="text-sm font-medium text-gray-900 truncate leading-tight">
                        {attachment.name || `File ${index + 1}`}
                      </div>
                      {(uploadDate || uploaderName) && (
                        <div className="text-xs text-gray-500 leading-tight">
                          Attached By {uploaderName}
                          {uploadDate &&
                            uploadTime &&
                            ` · ${uploadDate} · ${uploadTime}`}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delete button */}
                  {!readOnly && !isContentPage && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={e => {
                        e.stopPropagation();
                        handleFileRemove(index);
                      }}
                      className="flex-shrink-0 h-8 w-8 text-gray-500 hover:text-red-500 mt-0.5"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SectionCardDetail>
  );
}
