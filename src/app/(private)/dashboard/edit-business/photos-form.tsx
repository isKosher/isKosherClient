"use client";

import type React from "react";
import { useState, useRef } from "react";
import type { BusinessPreview, UserOwnedBusinessResponse } from "@/types";
import { Plus, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Import the API service
import { updateBusinessPhotos, uploadFile } from "@/app/actions/dashboardAction";

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

  // Add loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRemovePhoto = (id: string) => {
    setPhotos(photos.filter((photo) => photo.id !== id));
  };

  const handleAddPhoto = () => {
    if (newPhoto.url) {
      const id = crypto.randomUUID();
      setPhotos([...photos, { ...newPhoto, id }]);
      setNewPhoto({ url: "", photo_info: "" });
      setIsAdding(false);
    }
  };

  // Add file upload handler
  const handleFileUpload = async () => {
    if (!fileInputRef.current?.files?.length) return;

    try {
      setIsUploading(true);
      const file = fileInputRef.current.files[0];

      const response = await uploadFile(file, "photo");

      if (response.error) {
        throw new Error(response.message);
      }

      // Update the new photo with the URL from the response
      setNewPhoto({
        ...newPhoto,
        url: response.url,
      });
    } catch (err) {
      console.error("Failed to upload photo:", err);
      setError(err instanceof Error ? err.message : "שגיאה בהעלאת התמונה");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError(null);

      // Update photos
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

      // Close the dialog on success with a message
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
            <>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleFileUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-[#1A365D] border-sky-200"
                onClick={() => setIsAdding(true)}
              >
                <Plus className="h-4 w-4 ml-1" /> הוסף תמונה
              </Button>
            </>
          )}
        </div>

        {isAdding && (
          <Card className="border-sky-200 mb-4">
            <CardContent className="p-4 space-y-3">
              <div>
                <Label className="text-[#1A365D]">קישור לתמונה</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="הזן קישור לתמונה"
                    className="border-sky-200 focus:border-sky-500"
                    value={newPhoto.url}
                    onChange={(e) => setNewPhoto({ ...newPhoto, url: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="text-[#1A365D] border-sky-200"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#1A365D] border-t-transparent mr-1"></div>
                        מעלה...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-1" /> העלה
                      </>
                    )}
                  </Button>
                </div>
              </div>
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
                  onClick={() => setIsAdding(false)}
                  className="border-gray-300"
                >
                  ביטול
                </Button>
                <Button type="button" size="sm" className="bg-[#1A365D] hover:bg-[#2D4A6D]" onClick={handleAddPhoto}>
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
