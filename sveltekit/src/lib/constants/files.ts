import type { Column } from "$lib/ts/types";

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const columns: Column[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "tags", label: "Tags", sortable: false },
  { key: "lastModified", label: "Date", sortable: true },
  { key: "size", label: "Size", sortable: true },
  { key: "type", label: "Type", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: null, label: "CID", sortable: false }
];
