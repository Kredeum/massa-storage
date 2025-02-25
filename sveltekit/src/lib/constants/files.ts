import type { Column } from "$lib/ts/types";

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const columns: Column[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "sizeInBytes", label: "Size", sortable: true },
  { key: "type", label: "Type", sortable: true },
  { key: "cid", label: "CID", sortable: false },
  { key: null, label: "Actions", sortable: false }
];
