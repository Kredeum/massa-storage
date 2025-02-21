<script lang="ts">
  import type { FilterState, SortConfig, FileItem } from "$lib/ts/types";
  import { STATUS_APPROVED, STATUS_PENDING, STATUS_REJECTED } from "@kredeum/massa-storage-common/src/constants";

  let {
    filters,
    onTypeFilter,
    onSort,
    files = []
  }: {
    filters: FilterState;
    onTypeFilter: (value: FilterState["type"]) => void;
    onSort: (config: SortConfig) => void;
    files: FileItem[];
  } = $props();

  function handleTypeFilterChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value as FilterState["type"];
    onTypeFilter(value);
  }

  function handleStatusFilterChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value as FilterState["status"];
    filters.status = value;
  }
</script>

<div class="flex flex-col space-y-4">
  <div class="flex items-center space-x-4">
    <select class="rounded-md border border-gray-300 px-3 py-1.5 text-sm" onchange={handleTypeFilterChange} value={filters.type}>
      <option value="all">All Types</option>
      <option value="document">Document</option>
      <option value="image">Image</option>
      <option value="video">Video</option>
      <option value="audio">Audio</option>
    </select>

    <select class="rounded-md border border-gray-300 px-3 py-1.5 text-sm" onchange={handleStatusFilterChange} value={filters.status}>
      <option value="all">All Status</option>
      <option value={STATUS_APPROVED}>Approved</option>
      <option value={STATUS_PENDING}>Pending</option>
      <option value={STATUS_REJECTED}>Rejected</option>
    </select>
  </div>
</div>
