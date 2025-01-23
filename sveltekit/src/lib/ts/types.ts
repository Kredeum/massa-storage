type EmptyObject = Record<string, never>;

export type { EmptyObject };

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
  uploadDate: string;
  blob?: Blob;
  file?: File | undefined;
  cid: string | undefined;
  mimeType: string;
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

export type Column = {
  key: keyof FileItem | null;
  label: string;
  sortable: boolean;
};

export interface PropsFileTable {
  files: FileItem[];
  paginatedFiles: FileItem[];
  selectedFiles?: number[];
  sortConfig: SortConfig;
  handleSort: (key: keyof FileItem) => void;
  onSelectionChange: (selected: number[]) => void;
  onFilterChange: (status: FileStatus | "all") => void;
  actions?: import("svelte").Snippet<[FileItem]>;
  filteredFiles: FileItem[];
}
