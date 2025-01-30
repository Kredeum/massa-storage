type EmptyObject = Record<string, never>;

export type { EmptyObject };

export type FileType = "image" | "video" | "audio" | "document";

export type FileStatus = "Pending" | "Approved" | "Rejected";

export interface FileItem {
  arrayBuffer?: ArrayBuffer;
  name: string; // récuperer en récupérant unixfs
  sizeInBytes: number; //unixfs
  type?: FileType; // getFileType(mimeType) à voir
  tags: string[]; // on abandonne l'idée de tag générique? Enlever Tags complet
  status: FileStatus; // pending, approved, rejected à chercher sur contrat?
  isPinned?: boolean; //à chercher sur kubo
  uploadDate: string; // à garder dans la blockchain?
  blob?: Blob; // pas besoin
  file?: File | undefined; // pas besoin
  cid: string; // à virer
  mimeType?: string; // a garder// //soit unixfs soit on va le calculer en fonction de l'extension de name
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
  selectedFiles?: string[];
  sortConfig: SortConfig;
  handleSort: (key: keyof FileItem) => void;
  onSelectionChange: (selected: string[]) => void;
  onFilterChange: (status: FileStatus | "all") => void;
  actions?: import("svelte").Snippet<[FileItem]>;
  filteredFiles: FileItem[];
}

export interface PropsFilePagination {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  setPage: (page: number) => void;
}
