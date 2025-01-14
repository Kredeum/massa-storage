<script lang="ts">
  import type { FilterState, SortConfig, FileItem } from "$lib/types/file";

  let {
    filters,
    sortConfig,
    onTypeFilter,
    onSort
  }: {
    filters: FilterState;
    sortConfig: SortConfig;
    onTypeFilter: (value: FilterState["type"]) => void;
    onSort: (key: keyof FileItem) => void;
  } = $props();

  function handleTypeFilterChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value as FilterState["type"];
    onTypeFilter(value);
  }

  function handleSortChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value as keyof FileItem;
    onSort(value);
  }
</script>

<div class="flex space-x-4">
  <div class="flex items-center space-x-2">
    <select class="rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={filters.type} onchange={handleTypeFilterChange}>
      <option value="all">All Types</option>
      <option value="document">Document</option>
      <option value="image">Image</option>
      <option value="video">Video</option>
      <option value="audio">Audio</option>
    </select>
  </div>
  <div class="flex items-center space-x-2">
    <select class="rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={sortConfig.key} onchange={handleSortChange}>
      <option value="name">Name</option>
      <option value="lastModified">Date</option>
      <option value="size">Size</option>
      <option value="type">Type</option>
      <option value="status">Status</option>
    </select>
  </div>
</div>
