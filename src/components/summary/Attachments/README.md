# Attachments Component

A React component for handling comments and file attachments in quote/order summary pages.

## Overview

The `Attachments` component provides functionality for:
- **Comments**: Textarea for user comments with XSS validation and character counting
- **File Attachments**: File upload with progress tracking, validation, and S3 storage integration

## Props

```typescript
interface AttachmentsProps {
  showHeader?: boolean;              // Show card header (default: true)
  showAttachments?: boolean;         // Show attachments section (default: true)
  editAttachments?: boolean;        // Allow editing attachments (default: true)
  showComments?: boolean;            // Show comments section (default: false)
  editComments?: boolean;             // Allow editing comments (default: true)
  fieldName?: string;                // Form field name for attachments (default: "uploadedDocumentDetails")
  folderName?: string;               // S3 folder name (default: "Quote")
  isContentPage?: boolean;            // Is content/edit page (default: false)
  isOrder?: boolean;                  // Is order (vs quote) (default: false)
  readOnly?: boolean;                 // Read-only mode (default: false)
}
```

## Usage

### Basic Usage

```tsx
import Attachments from "@/components/summary/Attachments/Attachments";
import { FormProvider, useForm } from "react-hook-form";

function QuoteSummaryPage() {
  const methods = useForm({
    defaultValues: {
      comment: "",
      uploadedDocumentDetails: [],
      uploading: false,
    },
  });

  return (
    <FormProvider {...methods}>
      <Attachments
        showComments={true}
        showAttachments={true}
      />
    </FormProvider>
  );
}
```

### With Custom Configuration

```tsx
<Attachments
  showHeader={true}
  showAttachments={true}
  showComments={true}
  editAttachments={true}
  editComments={true}
  fieldName="customAttachments"
  folderName="Orders"
  isContentPage={false}
  isOrder={false}
  readOnly={false}
/>
```

## Features

### Comments Section

- **XSS Validation**: Automatically detects and prevents XSS attacks in comments
- **Character Limit**: 2000 characters maximum with live counter
- **Error Display**: Shows validation errors below textarea
- **Disabled State**: Can be disabled via `editComments` prop
- **Content Page**: Comments section is hidden on content pages (`isContentPage={true}`)

### File Attachments

- **File Validation**:
  - Maximum file size: 2MB
  - Allowed types: PDF, DOC, DOCX, JPG, JPEG, PNG, XLSX
- **Upload Progress**: Real-time progress bar during upload
- **S3 Integration**: Files are uploaded to S3 using presigned URLs
- **File List**: Displays uploaded files with click-to-open functionality
- **File Removal**: Remove files with automatic S3 cleanup
- **Backend Sync**: Automatically saves to backend on content pages

### File Upload Flow

1. User selects file
2. File is validated (size and type)
3. Upload progress is tracked
4. File is uploaded to S3 via `UploadServices.postUpload`
5. Attachment metadata is added to form state
6. If `isContentPage`, attachments are saved to backend
7. Success toast is shown

### File Removal Flow

1. User clicks remove button
2. File is deleted from S3 (if URL exists)
3. File is removed from form state
4. If `isContentPage`, updated list is saved to backend
5. Success toast is shown

## Form State

The component expects the following form fields:

```typescript
{
  comment: string;                    // Comment text
  uploadedDocumentDetails: Array<{    // Array of attachments
    name: string;
    source: string;
    filePath: string;
    type: string;
    // ... other fields
  }>;
  uploading: boolean;                  // Upload in progress
  orderIdentifier?: string;           // For orders
  quotationIdentifier?: string;       // For quotes
}
```

## Attachment Object Structure

```typescript
{
  fromMessage: false,
  type: string,                        // File extension (e.g., "pdf")
  name: string,                        // File name
  width: string,                       // "User,ISOString"
  source: string,                      // S3 URL
  new: true,
  attachment: string,                  // S3 URL
  attachmentType: string,              // File extension
  filePath: string,                    // S3 URL
}
```

## Dependencies

- **react-hook-form**: Form state management
- **useCurrentUser**: Current user information
- **UploadServices**: S3 file upload service
- **axios**: HTTP requests for backend sync
- **sonner**: Toast notifications
- **containsXSS**: XSS validation utility

## Behavior

### Conditional Rendering

- Component returns `null` if both `showComments` and `showAttachments` are `false`
- Comments section is hidden when `isContentPage={true}`
- Remove button is hidden when `readOnly={true}` or `isContentPage={true}`

### Content Page Behavior

When `isContentPage={true}`:
- Comments section is hidden
- Attachments are automatically saved to backend after upload/removal
- Uses different API endpoints for orders vs quotes

### File Click Behavior

Clicking on an attachment opens it in a new tab if `source` or `filePath` is available.

## Testing

See `Attachments.test.tsx` for comprehensive test coverage including:
- Component rendering
- Comments functionality
- File upload validation
- Upload progress tracking
- File removal
- Error handling
- Edge cases

## Mock Data

See `Attachments.mocks.tsx` for mock data and test utilities.

