export interface File {
  id: number;
  name: string;
  size: number;
  type: string;
}

export interface Filters {
  type: string[];
  size: string[];
}

export interface SortConfig {
  key: keyof File | null;
  direction: "asc" | "desc";
}
