"use client";

import { useState, useRef, useEffect } from "react";
import type React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Upload, X, FileIcon, ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadImage, deleteImage } from "@/app/actions/uploadsAction";
import { DOCUMENT_TYPES, FileUploaderType, FileUploadResponse, FolderGoogleType } from "@/types/file-upload";
import { UPLOAD_COOLDOWN, UPLOAD_DELAY } from "@/lib/constants";

interface FileUploaderProps {
  label: string;
  value: File | null;
  onChange: (file: File | null, uploadInfo?: FileUploadResponse) => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
  autoUpload?: boolean;
  folderType: FolderGoogleType;
  uploaderType?: FileUploaderType;
  rtl?: boolean;
  uploadedInfo?: FileUploadResponse | null; // New prop to pass existing upload info
}

export function FileUploader({
  label,
  value,
  onChange,
  accept,
  maxSizeMB = 10,
  className,
  autoUpload = true,
  folderType,
  uploaderType = FileUploaderType.ANY,
  rtl = true,
  uploadedInfo = null,
}: FileUploaderProps) {
  // State variables
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fileInfo, setFileInfo] = useState<FileUploadResponse | null>(uploadedInfo);
  const [lastUploadTime, setLastUploadTime] = useState<number>(0);
  const [uploadTimeout, setUploadTimeout] = useState<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Language and filetype specific messages
  const messages = {
    clickToUpload: rtl ? "לחץ להעלאה" : "Click to upload",
    dragHere: rtl ? "או גרור לכאן" : "or drag files here",
    fileTypes: getFileTypesText(),
    uploading: rtl ? "מעלה..." : "Uploading...",
    deleting: rtl ? "מוחק..." : "Deleting...",
    uploadSuccess: rtl ? "הועלה בהצלחה" : "Upload successful",
    waitBeforeNextUpload: (seconds: number) =>
      rtl ? `אנא המתן ${seconds} שניות לפני העלאה נוספת` : `Please wait ${seconds} seconds before next upload`,
    deleteExistingFirst: rtl
      ? "יש למחוק את הקובץ הקיים לפני העלאת קובץ חדש"
      : "Delete existing file before uploading a new one",
    invalidFileType: getInvalidFileTypeMessage(),
    fileTooLarge: rtl ? `גודל הקובץ חייב להיות קטן מ-${maxSizeMB}MB` : `File size must be less than ${maxSizeMB}MB`,
    uploadError: rtl ? "שגיאה בהעלאת הקובץ. אנא נסה שנית." : "Error uploading file. Please try again.",
    deleteError: rtl ? "שגיאה במחיקת הקובץ. אנא נסה שנית." : "Error deleting file. Please try again.",
  };

  // Effect to initialize preview from uploadedInfo
  useEffect(() => {
    if (uploadedInfo && uploadedInfo.web_view_link && !preview) {
      if (uploaderType === FileUploaderType.IMAGE) {
        // For images, set the web view link as the preview
        setPreview(uploadedInfo.web_view_link);
      } else {
        // For non-images, use document-preview
        setPreview("document-preview");
      }
      setFileInfo(uploadedInfo);
    }
  }, [uploadedInfo, preview, uploaderType]);

  // Helper functions for message generation
  function getFileTypesText() {
    switch (uploaderType) {
      case "image":
        return rtl ? `PNG, JPG, GIF עד ${maxSizeMB}MB` : `PNG, JPG, GIF up to ${maxSizeMB}MB`;
      case "document":
        return rtl ? `PDF, DOC, XLS, PPT עד ${maxSizeMB}MB` : `PDF, DOC, XLS, PPT up to ${maxSizeMB}MB`;
      case "any":
      default:
        return rtl ? `כל סוגי הקבצים עד ${maxSizeMB}MB` : `All file types up to ${maxSizeMB}MB`;
    }
  }

  function getInvalidFileTypeMessage() {
    switch (uploaderType) {
      case "image":
        return rtl ? "יש להעלות קובץ תמונה בלבד" : "Please upload image files only";
      case "document":
        return rtl ? "יש להעלות קובץ מסמך בלבד" : "Please upload document files only";
      case "any":
      default:
        return rtl ? "סוג קובץ לא תקין" : "Invalid file type";
    }
  }

  // Determine accept attribute based on uploaderType
  const getAcceptValue = () => {
    if (accept) return accept;

    switch (uploaderType) {
      case "image":
        return "image/*";
      case "document":
        return ".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx";
      case "any":
      default:
        return "*/*";
    }
  };

  // Cleanup function for timeouts and object URLs
  useEffect(() => {
    return () => {
      if (uploadTimeout) {
        clearTimeout(uploadTimeout);
      }
      // Only revoke URLs that we created with createObjectURL (not the web_view_link URLs)
      if (preview && preview !== "document-preview" && !preview.startsWith("http")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [uploadTimeout, preview]);

  // Validates file type based on uploaderType
  const isValidFileType = (file: File): boolean => {
    if (uploaderType === "any") return true;

    if (uploaderType === "image") {
      return file.type.startsWith("image/");
    }

    if (uploaderType === "document") {
      return DOCUMENT_TYPES.includes(file.type);
    }

    return false;
  };

  // Handle file selection
  const handleFileChange = (file: File | null) => {
    // Clear any existing timeout
    if (uploadTimeout) {
      clearTimeout(uploadTimeout);
      setUploadTimeout(null);
    }

    setError(null);

    if (!file) {
      setPreview(null);
      return;
    }

    // Validate file type
    if (!isValidFileType(file)) {
      setError(messages.invalidFileType);
      return;
    }

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(messages.fileTooLarge);
      return;
    }

    // Check upload cooldown
    const now = Date.now();
    if (now - lastUploadTime < UPLOAD_COOLDOWN) {
      setError(messages.waitBeforeNextUpload(Math.ceil((UPLOAD_COOLDOWN - (now - lastUploadTime)) / 1000)));
      return;
    }

    // Set preview based on file type
    if (file.type.startsWith("image/")) {
      const fileUrl = URL.createObjectURL(file);
      setPreview(fileUrl);
    } else {
      setPreview("document-preview"); // Special value for non-image files
    }

    // Check if we need to delete existing file first
    if (fileInfo && !isDeleting) {
      setError(messages.deleteExistingFirst);
      // Only revoke URLs that we created with createObjectURL
      if (preview && preview !== "document-preview" && !preview.startsWith("http")) {
        URL.revokeObjectURL(preview);
      }
      setPreview(null);
      return;
    }

    // Handle upload (auto or manual)
    if (autoUpload) {
      const timeout = setTimeout(() => {
        setLastUploadTime(Date.now());
        handleUpload(file);
      }, UPLOAD_DELAY);

      setUploadTimeout(timeout);
    } else {
      onChange(file);
    }
  };

  // Upload file to server
  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const uploadResult = await uploadImage(file, folderType);
      setFileInfo(uploadResult);
      onChange(file, uploadResult);
    } catch (error) {
      console.error("Upload error:", error);
      setError(messages.uploadError);
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  // Delete file from server
  const deleteFileFromServer = async (fileId: string) => {
    if (!fileId) return false;

    try {
      setIsDeleting(true);
      await deleteImage(fileId);
      return true;
    } catch (error) {
      console.error("Delete error:", error);
      setError(messages.deleteError);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  // Event handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileChange(file);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (isUploading || isDeleting) {
      return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = async () => {
    if (isDeleting || isUploading) {
      return;
    }

    if (uploadTimeout) {
      clearTimeout(uploadTimeout);
      setUploadTimeout(null);
    }

    if (fileInfo?.id) {
      const success = await deleteFileFromServer(fileInfo.id);
      if (!success) {
        return;
      }
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    // Only revoke URLs that we created with createObjectURL
    if (preview && preview !== "document-preview" && !preview.startsWith("http")) {
      URL.revokeObjectURL(preview);
    }

    setPreview(null);
    setFileInfo(null);
    onChange(null);
  };

  // Get the appropriate icon for file type
  const getFileIcon = () => {
    if (value?.type.startsWith("image/")) {
      return <ImageIcon className="h-12 w-12 text-sky-500" />;
    }
    return <FileIcon className="h-12 w-12 text-sky-500" />;
  };

  // Determine if component is in a busy state
  const isBusy = isUploading || isDeleting;

  return (
    <FormItem className={className} dir={rtl ? "rtl" : "ltr"}>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <div className="space-y-2">
          {/* Upload area */}
          {!preview && (
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                dragActive ? "border-sky-500 bg-sky-50" : "border-sky-200 hover:border-sky-300 hover:bg-sky-50/50",
                isBusy ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => {
                if (!isBusy) {
                  inputRef.current?.click();
                }
              }}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <Upload className="h-10 w-10 text-sky-500" />
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-sky-600">{messages.clickToUpload}</span> {messages.dragHere}
                </div>
                <p className="text-xs text-gray-500">{messages.fileTypes}</p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept={getAcceptValue()}
                onChange={handleInputChange}
                className="hidden"
                disabled={isBusy}
              />
            </div>
          )}

          {/* File preview */}
          {preview && (
            <div className="relative border rounded-lg overflow-hidden">
              <div className="aspect-video relative">
                {preview === "document-preview" ? (
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <div className="text-center">
                      <div className="flex justify-center">{getFileIcon()}</div>
                      <p className="mt-2 text-sm text-gray-600">{value?.name || "מסמך"}</p>
                    </div>
                  </div>
                ) : (
                  <Image src={preview} alt="Preview" fill className="object-contain" />
                )}
              </div>

              {/* Remove button */}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                onClick={handleRemove}
                disabled={isBusy}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Status indicators */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="bg-white p-3 rounded-md flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-sky-500" />
                    <span className="text-sm font-medium">{messages.uploading}</span>
                  </div>
                </div>
              )}

              {isDeleting && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="bg-white p-3 rounded-md flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-red-500" />
                    <span className="text-sm font-medium">{messages.deleting}</span>
                  </div>
                </div>
              )}

              {fileInfo && !isBusy && (
                <div className="absolute bottom-2 left-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-md">
                  {messages.uploadSuccess}
                </div>
              )}
            </div>
          )}

          {/* Error message */}
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}

          {/* Hidden field for form submission */}
          {fileInfo && <input type="hidden" name="uploadedFileId" value={fileInfo.id} />}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
