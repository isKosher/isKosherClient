"use client";
import type React from "react";
import { useState } from "react";
import type { UserOwnedBusinessResponse } from "@/types";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader } from "@/components/file-uploader";
import {
  extractFilename,
  FileUploaderType,
  FolderType,
  isUnsplashImageUrl,
  StorageProvider,
  type FileUploadResponse,
} from "@/types/file-upload";
import { createBusinessPhoto, deleteBusinessPhoto } from "@/app/actions/dashboardAction";
import { deleteFile } from "@/app/actions/uploadsAction";

type PhotosFormProps = {
  business: UserOwnedBusinessResponse;
  onClose: (refreshData?: boolean, message?: string) => void;
};

type Photo = {
  id: string;
  url: string;
  photo_info: string | null;
};

export default function PhotosForm({ business, onClose }: PhotosFormProps) {
  const [photos, setPhotos] = useState<Photo[]>([...business.business_photos]);
  const [isAdding, setIsAdding] = useState(false);
  const [newPhoto, setNewPhoto] = useState<Omit<Photo, "id">>({
    url: "",
    photo_info: "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadedInfo, setUploadedInfo] = useState<FileUploadResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRemovePhoto = async (photo: Photo) => {
    try {
      setIsLoading(true);
      setError(null);
      const fileId = extractFilename(photo.url);
      if (fileId && !isUnsplashImageUrl(photo.url)) {
        await deleteFile(fileId, FolderType.BUSINESS_PHOTOS, StorageProvider.SUPABASE);
      }
      await deleteBusinessPhoto(photo.id);
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    } catch (err) {
      setError("שגיאה במחיקת התמונה");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoFileChange = (file: File | null, uploadResponse?: FileUploadResponse) => {
    setPhotoFile(file);

    if (uploadResponse) {
      setUploadedInfo(uploadResponse);
      setNewPhoto((prevPhoto) => ({
        ...prevPhoto,
        url: uploadResponse.web_view_link,
      }));
    } else if (file === null) {
      setUploadedInfo(null);
      setNewPhoto((prevPhoto) => ({
        ...prevPhoto,
        url: "",
      }));
    }
  };

  const handleAddPhoto = async () => {
    if (!newPhoto.url) {
      setError("נא להעלות תמונה");
      return;
    }
    try {
      setIsLoading(true);
      setError(null);

      const createdPhoto = await createBusinessPhoto({
        business_id: business.business_id,
        photo: {
          url: newPhoto.url,
          photo_info: newPhoto.photo_info || undefined,
        },
      });

      if (!createdPhoto.id) {
        throw new Error("Photo creation failed: missing id");
      }
      setPhotos((prev) => [
        ...prev,
        {
          id: String(createdPhoto.id),
          url: createdPhoto.url,
          photo_info: createdPhoto.photo_info ?? null,
        },
      ]);
      setNewPhoto({ url: "", photo_info: "" });
      setPhotoFile(null);
      setUploadedInfo(null);
      setIsAdding(false);
    } catch (err) {
      setError("שגיאה בהוספת התמונה");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onClose(true, "התמונות עודכנו בהצלחה");
      }}
      className="space-y-6"
      dir="rtl"
    >
      <div>
        <div className="flex justify-between items-center mb-4">
          <Label className="text-[#1A365D] text-lg">תמונות העסק</Label>
          {!isAdding && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-[#1A365D] border-sky-200"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="h-4 w-4 ml-1" /> הוסף תמונה
            </Button>
          )}
        </div>

        {isAdding && (
          <Card className="border-sky-200 mb-4">
            <CardContent className="p-4 space-y-3">
              <FileUploader
                label="תמונת עסק"
                value={photoFile}
                onChange={handlePhotoFileChange}
                uploaderType={FileUploaderType.IMAGE}
                folderType={FolderType.BUSINESS_PHOTOS}
                maxSizeMB={10}
                direction="rtl"
                uploadedInfo={uploadedInfo}
                provider={StorageProvider.SUPABASE}
              />

              <div>
                <Label className="text-[#1A365D]">תיאור התמונה</Label>
                <Textarea
                  placeholder="הזן תיאור לתמונה"
                  className="border-sky-200 focus:border-sky-500 mt-1"
                  value={newPhoto.photo_info || ""}
                  onChange={(e) => setNewPhoto({ ...newPhoto, photo_info: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false);
                    setPhotoFile(null);
                    setUploadedInfo(null);
                    setNewPhoto({ url: "", photo_info: "" });
                  }}
                  className="border-gray-300"
                >
                  ביטול
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="bg-[#1A365D] hover:bg-[#2D4A6D]"
                  onClick={handleAddPhoto}
                  disabled={isLoading}
                >
                  הוסף
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <Card key={photo.id} className="border-sky-200 overflow-hidden">
              <div className="relative aspect-square">
                <img
                  src={photo.url || "/placeholder.svg"}
                  alt={photo.photo_info || "תמונת עסק"}
                  className="object-cover w-full h-full"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
                  onClick={() => handleRemovePhoto(photo)}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="p-3">
                {photo.photo_info && <p className="text-sm text-[#2D4A6D] truncate">{photo.photo_info}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        {error && <div className="bg-red-50 text-red-600 p-2 rounded-md text-sm">{error}</div>}
        <div className="flex justify-start gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onClose()}
            className="border-gray-300"
            disabled={isLoading}
          >
            ביטול
          </Button>
          <Button type="submit" className="bg-[#1A365D] hover:bg-[#2D4A6D]" disabled={isLoading}>
            {"שמור שינויים"}
          </Button>
        </div>
      </div>
    </form>
  );
}
