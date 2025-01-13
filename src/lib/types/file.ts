export type FileType = "image" | "video" | "audio" | "document";

export type FileStatus = "Pending" | "Approved" | "Rejected" | "Error";

export interface FileItem {
  id: number;
  name: string;
  size: string;
  type: FileType;
  status: FileStatus;
  isPinned: boolean;
  lastModified: string;
  blob?: Blob; // Optional blob for image preview
  mimeType?: string; // Store original MIME type for proper handling
  cid?: string; // IPFS Content Identifier - optional because it might not be available in case of error
  error?: string; // Error message if status is "Error"
}

export interface FilterState {
  type: "all" | "image" | "video" | "audio" | "document";
  status: "all" | FileStatus;
}

export interface SortConfig {
  key: keyof FileItem;
  direction: "asc" | "desc";
}
