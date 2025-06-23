"use client";

import { useState, useRef, useEffect } from "react";
import type React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Upload, X, FileIcon, ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadFile, deleteFile } from "@/app/actions/uploadsAction";
import { UPLOAD_COOLDOWN, UPLOAD_DELAY } from "@/lib/constants";
import { FileUploaderProps, FileUploaderType, StorageProvider } from "@/types/file-upload";
import { generateFileMessages } from "@/data/file-uploader-data";
import { compressImage, getAcceptValue, isValidFileType } from "@/utils/upload-utils";

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
  direction = "rtl",
  uploadedInfo = null,
  provider = StorageProvider.GOOGLE_DRIVE,
}: FileUploaderProps) {
  // State variables
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [fileInfo, setFileInfo] = useState(uploadedInfo);
  const [lastUploadTime, setLastUploadTime] = useState<number>(0);
  const [uploadTimeout, setUploadTimeout] = useState<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate messages based on language and type
  const messages = generateFileMessages(uploaderType, maxSizeMB, direction);

  // Effect to initialize preview from uploadedInfo
  useEffect(() => {
    if (uploadedInfo && uploadedInfo.web_view_link && !preview) {
      if (uploaderType === FileUploaderType.IMAGE) {
        setPreview(uploadedInfo.web_view_link);
      } else {
        setPreview("document-preview");
      }
      setFileInfo(uploadedInfo);
    }
  }, [uploadedInfo, preview, uploaderType]);

  // Cleanup function for timeouts and object URLs
  useEffect(() => {
    return () => {
      if (uploadTimeout) {
        clearTimeout(uploadTimeout);
      }
      if (preview && preview !== "document-preview" && !preview.startsWith("http")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [uploadTimeout, preview]);

  const getFileIcon = () => {
    if (value?.type?.startsWith("image/")) {
      return <ImageIcon className="h-12 w-12 text-sky-500" />;
    }
    return <FileIcon className="h-12 w-12 text-sky-500" />;
  };

  const handleFileChange = async (file: File | null) => {
    if (uploadTimeout) {
      clearTimeout(uploadTimeout);
      setUploadTimeout(null);
    }
    setError(null);

    if (!file) {
      setPreview(null);
      return;
    }

    if (!isValidFileType(file, uploaderType)) {
      setError(messages.invalidFileType);
      return;
    }

    const now = Date.now();
    if (now - lastUploadTime < UPLOAD_COOLDOWN) {
      setError(messages.waitBeforeNextUpload(Math.ceil((UPLOAD_COOLDOWN - (now - lastUploadTime)) / 1000)));
      return;
    }

    if (fileInfo && !isDeleting) {
      setError(messages.deleteExistingFirst);
      return;
    }

    let processedFile = file;

    // Check if file is too large and is an image - compress if needed
    if (file.size > maxSizeMB * 1024 * 1024 && file.type.startsWith("image/")) {
      try {
        setIsCompressing(true);
        processedFile = await compressImage(file, maxSizeMB);
      } catch (compressionError) {
        console.error("❌ Compression error:", compressionError);
        setError(messages.uploadError);
        setIsCompressing(false);
        return;
      } finally {
        setIsCompressing(false);
      }
    } else if (file.size > maxSizeMB * 1024 * 1024) {
      // Non-image files that are too large
      console.error(`❌ File too large (non-image):`, {
        fileName: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        maxAllowed: `${maxSizeMB}MB`,
        type: file.type,
      });
      setError(messages.fileTooLarge);
      return;
    } else {
      console.log(`✅ File size OK:`, {
        fileName: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        maxAllowed: `${maxSizeMB}MB`,
        type: file.type,
      });
    }

    // Create preview
    if (processedFile.type.startsWith("image/")) {
      const fileUrl = URL.createObjectURL(processedFile);
      setPreview(fileUrl);
    } else {
      setPreview("document-preview");
    }

    if (autoUpload) {
      const timeout = setTimeout(() => {
        setLastUploadTime(Date.now());
        handleUpload(processedFile);
      }, UPLOAD_DELAY);
      setUploadTimeout(timeout);
    } else {
      onChange(processedFile);
    }
  };

  // Upload file to server, now with provider
  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const uploadResult = await uploadFile(file, folderType, provider);
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

  // Delete file from server, now with provider
  const deleteFileFromServer = async (fileId: string) => {
    if (!fileId) return false;
    try {
      setIsDeleting(true);
      await deleteFile(fileId, folderType, provider);
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
    if (isBusy) {
      return;
    }
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = async () => {
    if (isDeleting || isUploading || isCompressing) {
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
    if (preview && preview !== "document-preview" && !preview.startsWith("http")) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setFileInfo(null);
    onChange(null);
  };

  const isBusy = isUploading || isDeleting || isCompressing;

  return (
    <div className={className} dir={direction}>
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#1A365D]">
        {label}
      </label>
      <div className="space-y-2 mt-2">
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
              accept={getAcceptValue(uploaderType, accept)}
              onChange={handleInputChange}
              className="hidden"
              disabled={isBusy}
            />
          </div>
        )}
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
            {isCompressing && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="bg-white p-3 rounded-md flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  <span className="text-sm font-medium">מעבד תמונה...</span>
                </div>
              </div>
            )}
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
        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
        {fileInfo && <input type="hidden" name="uploadedFileId" value={fileInfo.id} />}
      </div>
    </div>
  );
}
