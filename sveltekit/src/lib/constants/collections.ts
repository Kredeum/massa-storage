import type { CollectionItem } from "$lib/ts/types";

export const columns = [
  { key: "name", label: "Name", sortable: true },
  { key: "uploadDate", label: "Date", sortable: true },
  { key: "filesCount", label: "Files", sortable: true },
  { key: "totalSizeBytes", label: "Size", sortable: true },
  { key: "owner", label: "Owner", sortable: false },
  { key: "status", label: "Status", sortable: true },
  { key: "collectionCid", label: "CID", sortable: false }
] as const satisfies Array<{
  key: keyof CollectionItem;
  label: string;
  sortable: boolean;
}>;
