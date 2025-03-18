"use server";
import { FileUploadResponse, FolderGoogleType } from "@/types";
import { serverApi } from "@/utils/apiClient";

export const uploadImage = async (file: File, folderType: FolderGoogleType): Promise<FileUploadResponse> => {
  try {
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append("file", file);

    // Send the request to the server
    const response = await serverApi.post<FileUploadResponse>(
      `/admin/files/upload/${FolderGoogleType[folderType]}`,
      formData,
      {
        includeCookies: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (!response.data) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export async function deleteImage(fileId: string): Promise<boolean> {
  try {
    if (!fileId) {
      throw new Error("No file ID provided");
    }
    const response = await serverApi.delete<void>(`/admin/files/${fileId}`, {
      includeCookies: true,
    });

    if (response.status === 200) return true;

    return false;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw new Error("Failed to delete file");
  }
}
