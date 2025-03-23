import { DOCUMENT_TYPES, FileUploaderType, FileUploadMessages } from "@/types/file-upload";

export function generateFileMessages(
  uploaderType: FileUploaderType,
  maxSizeMB: number,
  direction: "rtl" | "ltr" = "rtl"
): FileUploadMessages {
  const isRTL = direction === "rtl";

  return {
    clickToUpload: isRTL ? "לחץ להעלאה" : "Click to upload",
    dragHere: isRTL ? "או גרור לכאן" : "or drag files here",
    fileTypes: getFileTypesText(uploaderType, maxSizeMB, isRTL),
    uploading: isRTL ? "מעלה..." : "Uploading...",
    deleting: isRTL ? "מוחק..." : "Deleting...",
    uploadSuccess: isRTL ? "הועלה בהצלחה" : "Upload successful",
    waitBeforeNextUpload: (seconds: number) =>
      isRTL ? `אנא המתן ${seconds} שניות לפני העלאה נוספת` : `Please wait ${seconds} seconds before next upload`,
    deleteExistingFirst: isRTL
      ? "יש למחוק את הקובץ הקיים לפני העלאת קובץ חדש"
      : "Delete existing file before uploading a new one",
    invalidFileType: getInvalidFileTypeMessage(uploaderType, isRTL),
    fileTooLarge: isRTL ? `גודל הקובץ חייב להיות קטן מ-${maxSizeMB}MB` : `File size must be less than ${maxSizeMB}MB`,
    uploadError: isRTL ? "שגיאה בהעלאת הקובץ. אנא נסה שנית." : "Error uploading file. Please try again.",
    deleteError: isRTL ? "שגיאה במחיקת הקובץ. אנא נסה שנית." : "Error deleting file. Please try again.",
  };
}

export function getFileTypesText(uploaderType: FileUploaderType, maxSizeMB: number, isRTL: boolean): string {
  switch (uploaderType) {
    case FileUploaderType.IMAGE:
      return isRTL ? `PNG, JPG, GIF עד ${maxSizeMB}MB` : `PNG, JPG, GIF up to ${maxSizeMB}MB`;
    case FileUploaderType.DOCUMENT:
      return isRTL ? `PDF, DOC, XLS, PPT עד ${maxSizeMB}MB` : `PDF, DOC, XLS, PPT up to ${maxSizeMB}MB`;
    case FileUploaderType.ANY:
    default:
      return isRTL ? `כל סוגי הקבצים עד ${maxSizeMB}MB` : `All file types up to ${maxSizeMB}MB`;
  }
}

export function getInvalidFileTypeMessage(uploaderType: FileUploaderType, isRTL: boolean): string {
  switch (uploaderType) {
    case FileUploaderType.IMAGE:
      return isRTL ? "יש להעלות קובץ תמונה בלבד" : "Please upload image files only";
    case FileUploaderType.DOCUMENT:
      return isRTL ? "יש להעלות קובץ מסמך בלבד" : "Please upload document files only";
    case FileUploaderType.ANY:
    default:
      return isRTL ? "סוג קובץ לא תקין" : "Invalid file type";
  }
}

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
