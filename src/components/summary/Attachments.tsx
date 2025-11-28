"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { UploadProgress } from "@/lib/api/services/UploadServices/UploadServices";
import UploadServices from "@/lib/api/services/UploadServices/UploadServices";
import { cn } from "@/lib/utils";
import { containsXSS } from "@/utils/sanitization/sanitization.utils";
import axios from "axios";
import { isEmpty } from "lodash";
import { FileText, Upload, X } from "lucide-react";
import { useState } from "react";
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
  editComments = true,
  fieldName = "uploadedDocumentDetails",
  folderName = "Quote",
  isContentPage = false,
  isOrder = false,
  readOnly = false,
}: AttachmentsProps) {
  const {
    register,
    watch,
    setValue,
    trigger,
    formState: { errors },
    setError,
    clearErrors,
  } = useFormContext();

  const { user } = useCurrentUser();
  const comment = watch("comment");
  const uploadedDocumentDetails = watch(fieldName) || [];
  const uploading = watch("uploading");

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFileName, setUploadingFileName] = useState("");

  // Handle comment change with XSS validation
  const handleCommentChange = async (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;

    // Check for XSS content and show snackbar + set manual error
    if (value && containsXSS(value)) {
      toast.error("Invalid content detected");
      setError("comment", {
        type: "manual",
        message: "Invalid content",
      });
    } else {
      clearErrors("comment");
    }

    setValue("comment", value);
    await trigger("comment");
  };

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
    const allowedTypes = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".xlsx"];
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

  return (
    <Card className="shadow-sm mt-4">
      {showHeader && (
        <>
          <CardHeader className="px-6 py-4 bg-gray-50 rounded-t-lg">
            <CardTitle className="text-xl font-semibold text-gray-900">
              {showComments && showAttachments
                ? "Comments & Attachments"
                : showComments
                ? "Comments"
                : "Attachments"}
            </CardTitle>
          </CardHeader>
          <Separator />
        </>
      )}
      <CardContent className="px-6 py-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Comments Section */}
          {showComments && !isContentPage && (
            <div
              className={cn(
                "space-y-2",
                showAttachments ? "md:w-[65%]" : "w-full"
              )}
              id="comment"
            >
              <Label htmlFor="comment" className="text-sm font-medium">
                Comments
              </Label>
              <Textarea
                id="comment"
                {...register("comment", {
                  onChange: handleCommentChange,
                })}
                placeholder="Type your comments here..."
                rows={4}
                maxLength={2000}
                disabled={!editComments}
                className={cn(
                  errors.comment && "border-red-500",
                  "resize-none"
                )}
              />
              {errors.comment && (
                <p className="text-sm text-red-500">
                  {errors.comment.message as string}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {(comment as string)?.length || 0}/2000 characters
              </p>
            </div>
          )}

          {/* Attachments Section */}
          {showAttachments && (
            <div
              className={cn(
                "space-y-2",
                showComments && !isContentPage ? "md:w-[35%]" : "w-full"
              )}
            >
              {showHeader && (
                <Label className="text-sm font-medium">Attachments</Label>
              )}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    id="file-upload"
                    onChange={handleFileUpload}
                    disabled={uploading || !editAttachments}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx"
                  />
                  <Label
                    htmlFor="file-upload"
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 border border-dashed rounded-md cursor-pointer hover:bg-accent transition-colors",
                      (uploading || !editAttachments) &&
                        "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Upload className="h-4 w-4" />
                    {uploading
                      ? `Uploading... ${uploadProgress}%`
                      : "Upload File"}
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Max 2MB (PDF, DOC, DOCX, JPG, PNG, XLSX)
                </p>

                {/* Upload Progress */}
                {uploading && uploadingFileName && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="truncate">{uploadingFileName}</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Attached Files List */}
                {!isEmpty(uploadedDocumentDetails) && (
                  <div className="space-y-2 mt-4 bg-gray-50 rounded-md p-2">
                    {uploadedDocumentDetails.map((attachment: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded-md bg-white"
                      >
                        <div
                          className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
                          onClick={() => {
                            if (attachment.source || attachment.filePath) {
                              window.open(
                                attachment.source || attachment.filePath,
                                "_blank"
                              );
                            }
                          }}
                        >
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm truncate">
                            {attachment.name || `File ${index + 1}`}
                          </span>
                        </div>
                        {!readOnly && !isContentPage && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleFileRemove(index)}
                            className="flex-shrink-0 h-8 w-8"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

