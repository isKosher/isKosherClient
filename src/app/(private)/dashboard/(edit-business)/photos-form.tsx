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
import { FileUploaderType, FolderGoogleType, type FileUploadResponse } from "@/types/file-upload";
import { updateBusinessPhotos } from "@/app/actions/dashboardAction";

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

  const handleRemovePhoto = (id: string) => {
    setPhotos(photos.filter((photo) => photo.id !== id));
  };

  const handlePhotoFileChange = (file: File | null, uploadResponse?: FileUploadResponse) => {
    setPhotoFile(file);

    if (uploadResponse) {
      setUploadedInfo(uploadResponse);
      setNewPhoto({
        ...newPhoto,
        url: uploadResponse.web_view_link,
      });
    } else if (file === null) {
      setUploadedInfo(null);
      setNewPhoto({
        ...newPhoto,
        url: "",
      });
    }
  };

  const handleAddPhoto = () => {
    if (newPhoto.url) {
      const id = crypto.randomUUID();
      setPhotos([...photos, { ...newPhoto, id }]);
      setNewPhoto({ url: "", photo_info: "" });
      setPhotoFile(null);
      setUploadedInfo(null);
      setIsAdding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError(null);

      const response = await updateBusinessPhotos({
        businessId: business.business_id,
        photos: photos.map((photo) => ({
          id: photo.id,
          url: photo.url,
          photo_info: photo.photo_info,
        })),
      });

      if (response.error) {
        throw new Error(response.message);
      }

      onClose(true, "התמונות עודכנו בהצלחה");
    } catch (err) {
      console.error("Failed to update photos:", err);
      setError(err instanceof Error ? err.message : "שגיאה בעדכון התמונות");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
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
                folderType={FolderGoogleType.BUSINESS_PHOTOS}
                maxSizeMB={5}
                direction="rtl"
                uploadedInfo={uploadedInfo}
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
                  disabled={!newPhoto.url}
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
                  onClick={() => handleRemovePhoto(photo.id)}
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
            {isLoading ? (
              <>
                <span className="ml-2">שומר שינויים...</span>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              </>
            ) : (
              "שמור שינויים"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
