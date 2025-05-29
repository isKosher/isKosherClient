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

export enum FolderGoogleType {
  CERTIFICATES = "CERTIFICATES",
  SUPERVISORS = "SUPERVISORS",
  BUSINESS_PHOTOS = "BUSINESS_PHOTOS",
}

export interface FileUploadResponse {
  id: string;
  web_view_link: string;
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
  folderType: FolderGoogleType;
  uploaderType?: FileUploaderType;
  direction?: "rtl" | "ltr";
  uploadedInfo?: FileUploadResponse | null;
}
