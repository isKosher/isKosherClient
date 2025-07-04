"use server";
import { FileUploadResponse, FolderType, StorageProvider } from "@/types/file-upload";
import { serverApi } from "@/utils/apiClient";

export const uploadFile = async (
  file: File,
  folderType: FolderType,
  provider: StorageProvider = StorageProvider.GOOGLE_DRIVE
): Promise<FileUploadResponse> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await serverApi.postRaw(`/admin/files/upload/${provider}/${folderType}`, formData, {
      includeCookies: true,
    });
    const formattedResponse: FileUploadResponse = await response.json();
    if (!formattedResponse) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    return formattedResponse;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

export async function deleteFile(
  fileId: string,
  folderType: FolderType,
  provider: StorageProvider = StorageProvider.GOOGLE_DRIVE
): Promise<boolean> {
  try {
    if (!fileId) {
      throw new Error("No file ID provided");
    }
    const response = await serverApi.deleteRaw(`/admin/files/${provider}/${folderType}?fileId=${fileId}`, {
      includeCookies: true,
    });

    return response.status === 200;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw new Error("Failed to delete file");
  }
}
