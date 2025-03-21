import type {
  STATUS_APPROVED,
  STATUS_PENDING,
  STATUS_REJECTED
} from "@kredeum/massa-storage-common/src/constants";
import type { Snippet } from "svelte";

type EmptyObject = Record<string, never>;

export type { EmptyObject };

export type StatusType = typeof STATUS_PENDING | typeof STATUS_APPROVED | typeof STATUS_REJECTED;

export type FileType = "image" | "video" | "audio" | "document";

export interface FileItem {
  arrayBuffer?: ArrayBuffer;
  name: string;
  sizeInBytes: number;
  status: StatusType;
  type?: FileType;
  isPinned?: boolean;
  blob?: Blob;
  file?: File | undefined;
  cid: string;
}

export interface CollectionItem {
  owner: string;
  collectionCid: string;
  name: string;
  totalSizeBytes: number;
  filesCount: number;
  status: StatusType;
  timestamp: number;
  isPinned: boolean;
  isLocal: boolean;
}

export interface FilterState {
  type: "all" | "image" | "video" | "audio" | "document";
}

export interface CollectionFilterState {
  status: "all" | StatusType;
}

export interface SortConfig {
  key: keyof FileItem | keyof CollectionItem;
  direction: "asc" | "desc";
}

export interface CollectionSortConfig {
  key: keyof CollectionItem;
  direction: "asc" | "desc";
}

export type Column = {
  key: keyof FileItem | keyof CollectionItem | null;
  label: string;
  sortable: boolean;
};

export interface PropsFileTable {
  files: FileItem[];
  paginatedFiles: FileItem[];
  sortConfig: SortConfig;
  handleSort: (key: keyof FileItem) => void;
  actions?: Snippet<[FileItem]>;
}

export interface PropsCollectionTable {
  directories: CollectionItem[];
  paginatedDirectories: CollectionItem[];
  selectedDirectories?: string[];
  sortConfig: CollectionSortConfig;
  handleSort: (key: keyof CollectionItem) => void;
  onSelectionChange: (selected: string[]) => void;
  onFilterChange: (status: StatusType | "all") => void;
  onDirectoryClick: (dirCid: string) => void;
  filteredDirectories: CollectionItem[];
}

export interface PropsFilePagination {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  setPage: (page: number) => void;
}

export type CidDataType = {
  name: string;
  owner: string;
  status: string;
  timestamp: number;
};

export type CidDataTypePlus = CidDataType & { isPinned?: boolean; isLocal?: boolean };
