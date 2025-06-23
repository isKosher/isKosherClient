export enum FileUploaderType {
  IMAGE = "image",
  DOCUMENT = "document",
  ANY = "any",
}

export const DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
];

export enum StorageProvider {
  GOOGLE_DRIVE = "GOOGLE_DRIVE",
  SUPABASE = "SUPABASE",
}

export enum FolderType {
  CERTIFICATES = "CERTIFICATES",
  SUPERVISORS = "SUPERVISORS",
  BUSINESS_PHOTOS = "BUSINESS_PHOTOS",
}

export interface FileUploadResponse {
  id: string;
  web_view_link: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export interface FileType {
  id: string;
  name: string;
  web_view_link: string;
  mimeType: string;
  folderType: FolderType;
}

export interface FileUploadMessages {
  clickToUpload: string;
  dragHere: string;
  fileTypes: string;
  uploading: string;
  deleting: string;
  uploadSuccess: string;
  waitBeforeNextUpload: (seconds: number) => string;
  deleteExistingFirst: string;
  invalidFileType: string;
  fileTooLarge: string;
  uploadError: string;
  deleteError: string;
}

export interface FileUploaderProps {
  label: string;
  value: File | null;
  onChange: (file: File | null, uploadInfo?: FileUploadResponse) => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
  autoUpload?: boolean;
  folderType: FolderType;
  uploaderType?: FileUploaderType;
  direction?: "rtl" | "ltr";
  uploadedInfo?: FileUploadResponse | null;
  provider?: StorageProvider;
}
