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

//Move to src/lib/fileUploaderUtils.ts
export function getAcceptValue(uploaderType: FileUploaderType, accept?: string): string {
  if (accept) return accept;

  switch (uploaderType) {
    case FileUploaderType.IMAGE:
      return "image/*";
    case FileUploaderType.DOCUMENT:
      return ".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx";
    case FileUploaderType.ANY:
    default:
      return "*/*";
  }
}

export function isValidFileType(file: File, uploaderType: FileUploaderType): boolean {
  if (uploaderType === FileUploaderType.ANY) return true;

  if (uploaderType === FileUploaderType.IMAGE) {
    return file.type.startsWith("image/");
  }

  if (uploaderType === FileUploaderType.DOCUMENT) {
    return DOCUMENT_TYPES.includes(file.type);
  }

  return false;
}

export function extractFilename(url: string): string | null {
  // Match everything after the last slash
  const match = url.match(/\/([^\/?#]+)(?:[?#]|$)/);
  return match ? match[1] : null;
}
