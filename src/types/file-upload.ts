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
}

export interface FileUploadResponse {
  id: string;
  web_view_link: string;
}
