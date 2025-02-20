import type {
  STATUS_APPROVED,
  STATUS_PENDING,
  STATUS_REJECTED
} from "@kredeum/massa-storage-common/src/constants";

type EmptyObject = Record<string, never>;

export type { EmptyObject };

export type StatusType = typeof STATUS_PENDING | typeof STATUS_APPROVED | typeof STATUS_REJECTED;

export type FileType = "image" | "video" | "audio" | "document";

export interface FileItem {
  owner: string;
  arrayBuffer?: ArrayBuffer;
  name: string; // récuperer en récupérant unixfs
  sizeInBytes: number; //unixfs
  type?: FileType; // getFileType(mimeType) à voir
  tags: string[]; // on abandonne l'idée de tag générique? Enlever Tags complet
  status: StatusType; // pending, approved, rejected à chercher sur contrat?
  isPinned?: boolean; //à chercher sur kubo
  uploadDate: string; // à garder dans la blockchain?
  blob?: Blob; // pas besoin
  file?: File | undefined; // pas besoin
  cid: string; // à virer
  mimeType?: string; // a garder// //soit unixfs soit on va le calculer en fonction de l'extension de name
}

export interface FilterState {
  type: "all" | "image" | "video" | "audio" | "document" | "tag";
  status: "all" | StatusType;
  tags: string[];
}

export interface SortConfig {
  key: keyof FileItem | keyof CollectionItem;
  direction: "asc" | "desc";
}

export type Column = {
  key: keyof FileItem | keyof CollectionItem | null;
  label: string;
  sortable: boolean;
};

export interface CollectionItem {
  owner: string;
  collectionCid: string;
  name: string;
  totalSizeBytes: number;
  filesCount: number;
  status: StatusType;
  creationDate: string;
  isPinned: boolean;
}

export interface PropsFileTable {
  files: FileItem[];
  paginatedFiles: FileItem[];
  selectedFiles?: string[];
  sortConfig: SortConfig;
  handleSort: (key: keyof FileItem) => void;
  onSelectionChange: (selected: string[]) => void;
  onFilterChange: (status: StatusType | "all") => void;
  actions?: import("svelte").Snippet<[FileItem]>;
  filteredFiles: FileItem[];
}

export interface PropsCollectionTable {
  directories: CollectionItem[];
  paginatedDirectories: CollectionItem[];
  selectedDirectories?: string[];
  sortConfig: SortConfig;
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
  date: string;
};
