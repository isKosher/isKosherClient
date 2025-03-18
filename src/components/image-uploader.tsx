"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { uploadImage, deleteImage } from "@/app/actions/uploadsAction";
import { FileUploadResponse, FolderGoogleType } from "@/types";

interface ImageUploaderProps {
  label: string;
  value: File | null;
  onChange: (file: File | null, uploadInfo?: FileUploadResponse) => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
  autoUpload?: boolean;
  folderType: FolderGoogleType;
}

export function ImageUploader({
  label,
  value,
  onChange,
  accept = "image/*",
  maxSizeMB = 10,
  className,
  autoUpload = true,
  folderType,
}: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadedInfo, setUploadedInfo] = useState<FileUploadResponse | null>(null);
  const [lastUploadTime, setLastUploadTime] = useState<number>(0);
  const [uploadTimeout, setUploadTimeout] = useState<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const UPLOAD_COOLDOWN = 3000;
  const UPLOAD_DELAY = 1000;

  useEffect(() => {
    return () => {
      if (uploadTimeout) {
        clearTimeout(uploadTimeout);
      }
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [uploadTimeout, preview]);

  const handleFileChange = (file: File | null) => {
    if (uploadTimeout) {
      clearTimeout(uploadTimeout);
      setUploadTimeout(null);
    }

    setError(null);

    if (!file) {
      setPreview(null);
      return;
    }

    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setError("יש להעלות קובץ תמונה או PDF בלבד");
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`גודל הקובץ חייב להיות קטן מ-${maxSizeMB}MB`);
      return;
    }

    const now = Date.now();
    if (now - lastUploadTime < UPLOAD_COOLDOWN) {
      setError(`אנא המתן ${Math.ceil((UPLOAD_COOLDOWN - (now - lastUploadTime)) / 1000)} שניות לפני העלאה נוספת`);
      return;
    }

    const fileUrl = URL.createObjectURL(file);
    setPreview(fileUrl);

    if (uploadedInfo && !isDeleting) {
      setError("יש למחוק את התמונה הקיימת לפני העלאת תמונה חדשה");
      URL.revokeObjectURL(fileUrl);
      setPreview(null);
      return;
    }

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

  // Handle file upload to server
  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const uploadResult = await uploadImage(file, folderType);
      setUploadedInfo(uploadResult);
      onChange(file, uploadResult);
    } catch (error) {
      console.error("Upload error:", error);
      setError("שגיאה בהעלאת הקובץ. אנא נסה שנית.");
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const deleteImageFromServer = async (imageId: string) => {
    if (!imageId) return false;

    try {
      setIsDeleting(true);
      await deleteImage(imageId);
      return true;
    } catch (error) {
      console.error("Delete error:", error);
      setError("שגיאה במחיקת הקובץ. אנא נסה שנית.");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

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

    if (uploadedInfo?.id) {
      const success = await deleteImageFromServer(uploadedInfo.id);
      if (!success) {
        return;
      }
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setUploadedInfo(null);
    onChange(null);
  };

  return (
    <FormItem className={className}>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <div className="space-y-2">
          {/* Upload area */}
          {!preview && (
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                dragActive ? "border-sky-500 bg-sky-50" : "border-sky-200 hover:border-sky-300 hover:bg-sky-50/50",
                isUploading || isDeleting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => {
                if (!isUploading && !isDeleting) {
                  inputRef.current?.click();
                }
              }}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <Upload className="h-10 w-10 text-sky-500" />
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-sky-600">לחץ להעלאה</span> או גרור לכאן
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF, PDF עד {maxSizeMB}MB</p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleInputChange}
                className="hidden"
                disabled={isUploading || isDeleting}
              />
            </div>
          )}

          {preview && (
            <div className="relative border rounded-lg overflow-hidden">
              <div className="aspect-video relative">
                {preview && value?.type === "application/pdf" ? (
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <div className="text-center">
                      <div className="flex justify-center">
                        <svg className="h-12 w-12 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{value?.name}</p>
                    </div>
                  </div>
                ) : (
                  <Image src={preview} alt="תצוגה מקדימה" fill className="object-contain" />
                )}
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                onClick={handleRemove}
                disabled={isUploading || isDeleting}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Upload status indicator */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="bg-white p-3 rounded-md flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-sky-500" />
                    <span className="text-sm font-medium">מעלה...</span>
                  </div>
                </div>
              )}

              {isDeleting && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="bg-white p-3 rounded-md flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-red-500" />
                    <span className="text-sm font-medium">מוחק...</span>
                  </div>
                </div>
              )}

              {uploadedInfo && !isUploading && !isDeleting && (
                <div className="absolute bottom-2 left-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-md">
                  הועלה בהצלחה
                </div>
              )}
            </div>
          )}

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}

          {uploadedInfo && <input type="hidden" name="uploadedImageId" value={uploadedInfo.id} />}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
