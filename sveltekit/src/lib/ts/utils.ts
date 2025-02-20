import toast from "svelte-hot-french-toast";
import type { FileType } from "$lib/ts/types";

const shortenString = (addr: string) => {
  if (!addr) return "";
  if (addr.length < 16) return addr;
  return addr?.slice(0, 10) + "..." + addr?.slice(-4);
};

export { shortenString };

export async function copyToClipboard(
  text: string,
  successMessage: string = "Copied!"
): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMessage);
  } catch (err) {
    console.error("Failed to copy to clipboard:", err);
    toast.error("Failed to copy to clipboard");
  }
}

export function formatSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${Math.floor(size)} ${units[unitIndex]}`;
}

export function validateFiles(
  files: FileList,
  maxSize: number
): { valid: File[]; invalid: File[] } {
  const valid: File[] = [];
  const invalid: File[] = [];

  Array.from(files).forEach((file) => {
    if (file.size > maxSize) {
      invalid.push(file);
    } else {
      valid.push(file);
    }
  });

  return { valid, invalid };
}

export function getFileType(mimeType: string): FileType {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "document";
}

export function formatDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function getFileTypeFromName(fileName: string): FileType {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";

  // Image extensions
  if (["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"].includes(extension)) {
    return "image";
  }

  // Video extensions
  if (["mp4", "webm", "ogg", "mov", "avi", "mkv"].includes(extension)) {
    return "video";
  }

  // Audio extensions
  if (["mp3", "wav", "ogg", "aac", "m4a"].includes(extension)) {
    return "audio";
  }

  // Document extensions
  if (["pdf", "doc", "docx", "txt", "odt", "rtf"].includes(extension)) {
    return "document";
  }

  // Default to document for unknown types
  return "document";
}

export function timestamp(): string {
  return Date.now().toString();
}
