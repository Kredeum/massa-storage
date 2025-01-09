export type FileType = "image" | "video" | "sound" | "document";

export interface FileItem {
  id: number;
  name: string;
  size: string;
  type: FileType;
  status: "Pending" | "Approved" | "Rejected";
  isPinned: boolean;
  lastModified: string;
  blob?: Blob; // Optional blob for image preview
  mimeType?: string; // Store original MIME type for proper handling
  cid: string; // IPFS Content Identifier
}

export interface FilterState {
  type: "all" | "image" | "video" | "sound" | "document";
  status: "all" | "Pending" | "Approved" | "Rejected";
}

export interface SortConfig {
  key: keyof FileItem;
  direction: "asc" | "desc";
}
