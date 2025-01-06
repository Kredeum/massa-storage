<script lang="ts">
  import type { FilterState, SortConfig, FileItem } from '$lib/types/file';

  export let filters: FilterState;
  export let sortConfig: SortConfig;
  export let onTypeFilter: (value: FilterState['type']) => void;
  export let onSizeFilter: (value: string) => void;
  export let onSort: (key: keyof FileItem) => void;

  function handleTypeFilterChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value as FilterState['type'];
    onTypeFilter(value);
  }

  function handleSizeFilterChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value;
    onSizeFilter(value);
  }

  function handleSortChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value as keyof FileItem;
    onSort(value);
  }
</script>

<div class="flex space-x-4">
  <div class="flex items-center space-x-2">
    <span class="text-gray-500">📁</span>
    <select
      class="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={filters.type}
      on:change={handleTypeFilterChange}
    >
      <option value="all">All Types</option>
      <option value="document">Document</option>
      <option value="image">Image</option>
      <option value="video">Video</option>
      <option value="sound">Sound</option>
    </select>
  </div>
  <div class="flex items-center space-x-2">
    <span class="text-gray-500">🔄</span>
    <select
      class="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={sortConfig.key}
      on:change={handleSortChange}
    >
      <option value="name">Name</option>
      <option value="size">Size</option>
      <option value="type">Type</option>
    </select>
  </div>
</div>
