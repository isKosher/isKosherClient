"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { uploadImage } from "@/app/actions/uploadsAction";
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
  const [uploadedInfo, setUploadedInfo] = useState<FileUploadResponse | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Create preview when file is selected
  const handleFileChange = async (file: File | null) => {
    setError(null);
    setUploadedInfo(null);

    if (!file) {
      setPreview(null);
      onChange(null);
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setError("יש להעלות קובץ תמונה או PDF בלבד");
      return;
    }

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`גודל הקובץ חייב להיות קטן מ-${maxSizeMB}MB`);
      return;
    }

    // Create preview URL
    const fileUrl = URL.createObjectURL(file);
    setPreview(fileUrl);

    // Upload the file if autoUpload is enabled
    if (autoUpload) {
      await handleUpload(file);
    } else {
      onChange(file);
    }

    // Clean up preview URL when component unmounts
    return () => URL.revokeObjectURL(fileUrl);
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
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileChange(file);
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Handle remove file
  const handleRemove = () => {
    //TODO: Remove from server
    console.log(uploadedInfo?.id);

    if (inputRef.current) {
      inputRef.current.value = "";
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
                "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                dragActive ? "border-sky-500 bg-sky-50" : "border-sky-200 hover:border-sky-300 hover:bg-sky-50/50"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <Upload className="h-10 w-10 text-sky-500" />
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-sky-600">לחץ להעלאה</span> או גרור לכאן
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF, PDF עד {maxSizeMB}MB</p>
              </div>
              <input ref={inputRef} type="file" accept={accept} onChange={handleInputChange} className="hidden" />
            </div>
          )}

          {/* Preview area */}
          {preview && (
            <div className="relative border rounded-lg overflow-hidden">
              <div className="aspect-video relative">
                {value?.type === "application/pdf" ? (
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
                  <Image src={preview || "/placeholder.svg"} alt="תצוגה מקדימה" fill className="object-contain" />
                )}
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                onClick={handleRemove}
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

              {/* Upload success indicator */}
              {uploadedInfo && !isUploading && (
                <div className="absolute bottom-2 left-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-md">
                  הועלה בהצלחה
                </div>
              )}
            </div>
          )}

          {/* Error message */}
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}

          {/* Upload info (for debugging) */}
          {uploadedInfo && <input type="hidden" name="uploadedImageId" value={uploadedInfo.id} />}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
