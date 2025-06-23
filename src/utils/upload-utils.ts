import { DOCUMENT_TYPES, FileUploaderType } from "@/types/file-upload";

/**
 * Compresses an image file to ensure its size does not exceed the specified maximum size in megabytes (MB).
 * The function resizes the image while maintaining its aspect ratio, and iteratively reduces the quality
 * if necessary to meet the size constraint. The output format is preserved if possible (PNG or JPEG).
 *
 * @param file - The original image file to be compressed.
 * @param maxSizeMB - The maximum allowed size for the compressed image, in megabytes.
 * @returns A Promise that resolves to a new File object representing the compressed image.
 *
 * @throws {Error} If the image cannot be loaded, the canvas context cannot be obtained, or compression fails.
 */
export const compressImage = async (file: File, maxSizeMB: number): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new window.Image();

    img.onload = () => {
      // Calculate dimensions while maintaining aspect ratio
      const maxDimension = 1920; // Max width/height for high quality
      let { width, height } = img;

      if (width > height && width > maxDimension) {
        height = (height * maxDimension) / width;
        width = maxDimension;
      } else if (height > maxDimension) {
        width = (width * maxDimension) / height;
        height = maxDimension;
      }

      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Draw image on canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Determine output format (preserve original if possible)
      const outputFormat = file.type === "image/png" ? "image/png" : "image/jpeg";
      let quality = 0.95; // Start with high quality for certificates

      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"));
              return;
            }

            // Check if the compressed size is acceptable
            const compressedSize = blob.size / (1024 * 1024); // Convert to MB

            if (compressedSize <= maxSizeMB || quality <= 0.7) {
              // Create new File object with same name and last modified date
              const compressedFile = new File([blob], file.name, {
                type: outputFormat,
                lastModified: file.lastModified,
              });
              resolve(compressedFile);
            } else {
              // Reduce quality and try again
              quality -= 0.1;
              console.log(`🔄 Reducing quality to ${(quality * 100).toFixed(0)}% and trying again...`);
              tryCompress();
            }
          },
          outputFormat,
          quality
        );
      };

      tryCompress();
    };

    img.onerror = () => {
      reject(new Error("Failed to load image for compression"));
    };

    img.src = URL.createObjectURL(file);
  });
};

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

export function isUnsplashImageUrl(url: string): boolean {
  return url.startsWith("https://images.unsplash.com/");
}
