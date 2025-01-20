export type FileType = "image" | "video" | "audio" | "document";

export type FileStatus = "Pending" | "Approved" | "Rejected";

export interface FileItem {
  arrayBuffer: ArrayBuffer;
  id: number;
  name: string;
  size: string;
  sizeInBytes: number;
  type: FileType;
  tags: string[];
  status: FileStatus;
  isPinned: boolean;
  lastModified: string;
  blob?: Blob; // Optional blob for image preview
  file?: File | undefined; // Original File object
  mimeType?: string; // Store original MIME type for proper handling
  cid: string | undefined; // IPFS Content Identifier - optional because it might not be available in case of error
}

export interface FilterState {
  type: "all" | "image" | "video" | "audio" | "document" | "tag";
  status: "all" | FileStatus;
  tags: string[];
}

export interface SortConfig {
  key: keyof FileItem;
  direction: "asc" | "desc";
}
