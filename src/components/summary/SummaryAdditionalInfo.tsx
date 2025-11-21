"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText } from "lucide-react";
import { containsXSS } from "@/utils/sanitization/sanitization.utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { UploadService } from "@/lib/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface SummaryAdditionalInfoProps {
  isOrder?: boolean;
  showCustomerInfo?: boolean;
  showComments?: boolean;
  showAttachments?: boolean;
  isCustomerDateRequired?: boolean;
  requiredIncDate?: number;
  className?: string;
}

/**
 * Component for additional information section (customer info, comments, attachments)
 * Combines EndCustomerInfo, Comments, and Attachments from buyer-fe
 *
 * @param isOrder - Whether this is an order (affects field names)
 * @param showCustomerInfo - Whether to show customer information fields
 * @param showComments - Whether to show comments field
 * @param showAttachments - Whether to show attachments field
 * @param isCustomerDateRequired - Whether customer required date is mandatory
 * @param requiredIncDate - Minimum days from today for required date
 * @param className - Additional CSS classes
 */
export default function SummaryAdditionalInfo({
  isOrder: _isOrder = false,
  showCustomerInfo = true,
  showComments = true,
  showAttachments = true,
  isCustomerDateRequired = false,
  requiredIncDate = 0,
  className,
}: SummaryAdditionalInfoProps) {
  const {
    register,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext();

  const comment = watch("comment");
  const customerRequiredDate = watch("customerRequiredDate");
  const uploadedDocumentDetails = watch("uploadedDocumentDetails") || [];
  const { user } = useCurrentUser();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Handle comment change with XSS validation
  const handleCommentChange = async (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;

    if (value && containsXSS(value)) {
      toast.error("Invalid content detected");
      return;
    }

    setValue("comment", value);
    await trigger("comment");
  };

  // Handle buyer reference number change with XSS validation
  const handleBuyerRefChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;

    if (value && containsXSS(value)) {
      toast.error("Invalid content detected");
      return;
    }

    setValue("buyerReferenceNumber", value);
    await trigger("buyerReferenceNumber");
  };

  // Handle customer required date change
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      const minDate = addDays(new Date(), requiredIncDate);
      if (date < minDate) {
        toast.error(
          "Date must be at least " + requiredIncDate + " days from today"
        );
        return;
      }
    }
    setValue("customerRequiredDate", date);
    trigger("customerRequiredDate");
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Maximum file size of 2MB allowed");
      return;
    }

    // Validate file type
    const allowedTypes = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      toast.error("Invalid file type. Allowed: PDF, DOC, DOCX, JPG, PNG");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    e.target.value = ""; // Reset input immediately

    try {
      // Sanitize filename (similar to buyer-fe)
      const sanitizedFilename = file.name.replace(/[^A-Z0-9.]+/gi, "");
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}_${sanitizedFilename}`;
      const folderName = `app_assets/summary_attachments`;

      // Get presigned URL
      const presignedData = await UploadService.getPresignedUploadUrl(
        folderName,
        fileName
      );

      // Upload to S3 using presigned URL
      const formData = new FormData();
      Object.keys(presignedData.fields).forEach(key => {
        const value = presignedData.fields[key];
        if (value !== undefined) {
          formData.append(key, value);
        }
      });
      formData.append("file", file);

      // Create axios instance for S3 upload (no baseURL)
      const s3UploadClient = axios.create();
      await s3UploadClient.post(presignedData.url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: evt => {
          if (evt.total) {
            const progress = Math.round((evt.loaded / evt.total) * 100);
            setUploadProgress(progress);
          }
        },
      });

      // Construct S3 URL
      const s3Url = `https://${presignedData.Bucket}.s3.${presignedData.region}.amazonaws.com/${presignedData.key}`;
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "";

      // Create attachment object (matching buyer-fe format)
      const newAttachment = {
        id: Date.now().toString(),
        fromMessage: false,
        type: fileExt,
        name: file.name,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        width: `${user?.displayName || "User"},${new Date().toISOString()}`,
        source: s3Url,
        new: true,
        attachment: s3Url,
        attachmentType: fileExt,
        filePath: s3Url,
      };

      // Update form state
      const currentAttachments = Array.isArray(uploadedDocumentDetails)
        ? uploadedDocumentDetails
        : [];
      const updatedAttachments = [newAttachment, ...currentAttachments];
      setValue("uploadedDocumentDetails", updatedAttachments);
      setUploadProgress(0);
      toast.success("File uploaded successfully");
    } catch (error: any) {
      console.error("File upload error:", error);
      toast.error(error?.message || "Failed to upload file");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
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
            // Call delete API if it exists (buyer-fe uses /api/delete)
            await axios.post("/api/delete", {
              filename: key,
            });
          } catch (deleteError) {
            // If delete API doesn't exist or fails, just remove from form
            console.warn("Failed to delete file from S3:", deleteError);
          }
        }
      }

      // Remove from form state
      const updatedAttachments = uploadedDocumentDetails.filter(
        (_: unknown, i: number) => i !== index
      );
      setValue("uploadedDocumentDetails", updatedAttachments);
      toast.success("File removed");
    } catch (error) {
      console.error("File removal error:", error);
      toast.error("Failed to remove file");
    }
  };

  const minDate = addDays(new Date(), requiredIncDate);

  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader className="px-6 -my-5 bg-gray-50 rounded-t-lg">
        <CardTitle className="text-xl font-semibold text-gray-900 m-0">
          Additional Information
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="px-6 pt-6 pb-4 space-y-6">
        {/* Customer Information */}
        {showCustomerInfo && (
          <div className="space-y-4" id="endCustomerInfo">
            {/* Required Date */}
            {isCustomerDateRequired && (
              <div className="space-y-2">
                <Label
                  htmlFor="customerRequiredDate"
                  className="text-sm font-medium"
                >
                  Required Date {isCustomerDateRequired ? "*" : ""}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !customerRequiredDate && "text-muted-foreground",
                        errors.customerRequiredDate && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customerRequiredDate ? (
                        format(new Date(customerRequiredDate), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        customerRequiredDate
                          ? new Date(customerRequiredDate)
                          : undefined
                      }
                      onSelect={handleDateChange}
                      disabled={date => date < minDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.customerRequiredDate && (
                  <p className="text-xs text-destructive">
                    {errors.customerRequiredDate.message as string}
                  </p>
                )}
              </div>
            )}

            {/* Buyer Reference Number */}
            <div className="space-y-2">
              <Label
                htmlFor="buyerReferenceNumber"
                className="text-sm font-medium"
              >
                Buyer Reference Number
              </Label>
              <Input
                id="buyerReferenceNumber"
                {...register("buyerReferenceNumber")}
                onChange={handleBuyerRefChange}
                placeholder="Enter reference number"
                maxLength={35}
                className={cn(
                  errors.buyerReferenceNumber && "border-destructive"
                )}
              />
              {errors.buyerReferenceNumber && (
                <p className="text-xs text-destructive">
                  {errors.buyerReferenceNumber.message as string}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Comments */}
        {showComments && (
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-sm font-medium">
              Comments
            </Label>
            <Textarea
              id="comment"
              {...register("comment")}
              onChange={handleCommentChange}
              placeholder="Type your comments here..."
              rows={4}
              maxLength={2000}
              className={cn(
                errors.comment && "border-destructive",
                "resize-none"
              )}
            />
            {errors.comment && (
              <p className="text-xs text-destructive">
                {errors.comment.message as string}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {(comment as string)?.length || 0}/2000 characters
            </p>
          </div>
        )}

        {/* Attachments */}
        {showAttachments && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Attachments</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  id="file-upload"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <Label
                  htmlFor="file-upload"
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 border border-dashed rounded-md cursor-pointer hover:bg-accent transition-colors",
                    isUploading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Upload className="h-4 w-4" />
                  {isUploading
                    ? `Uploading... ${uploadProgress}%`
                    : "Upload File"}
                </Label>
                <p className="text-xs text-muted-foreground">
                  Max 2MB (PDF, DOC, DOCX, JPG, PNG)
                </p>
              </div>

              {/* Attached Files List */}
              {uploadedDocumentDetails.length > 0 && (
                <div className="space-y-2 mt-4">
                  {uploadedDocumentDetails.map(
                    (attachment: any, index: number) => (
                      <div
                        key={attachment.id || index}
                        className="flex items-center justify-between p-2 border rounded-md"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm truncate">
                            {attachment.fileName ||
                              attachment.name ||
                              `File ${index + 1}`}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleFileRemove(index)}
                          className="flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
