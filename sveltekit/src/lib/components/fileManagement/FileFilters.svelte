<script lang="ts">
  import type { FilterState, SortConfig, FileItem } from "$lib/ts/types";

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
  </div>
</div>
