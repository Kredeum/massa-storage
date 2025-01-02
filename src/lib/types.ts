export interface File {
  id: number;
  name: string;
  size: number;
  type: string;
  status?: 'pending' | 'approved' | 'rejected' | 'pinned';
}

export interface Filters {
  type: string[];
  size: (string | [number, number])[];
}

export interface SortConfig {
  key: keyof File | null;
  direction: "asc" | "desc";
}
