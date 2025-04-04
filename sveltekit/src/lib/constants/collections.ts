import type { CollectionItem } from "$lib/ts/types";

export const columns = [
  { key: "name", label: "Name", sortable: false },
  { key: "timestamp", label: "Date", sortable: true, defaultSort: { direction: "desc" } },
  { key: "filesCount", label: "Files", sortable: true },
  { key: "peersCount", label: "Peers", sortable: true },
  { key: "totalSizeBytes", label: "Size", sortable: true },
  { key: "owner", label: "Owner", sortable: false },
  { key: "collectionCid", label: "CID", sortable: false },
  { key: "status", label: "Status", sortable: true }
] as const satisfies Array<{
  key: keyof CollectionItem;
  label: string;
  sortable: boolean;
  defaultSort?: { direction: "asc" | "desc" };
}>;
