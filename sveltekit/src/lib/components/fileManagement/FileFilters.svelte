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

  // Get unique tags from files
  const uniqueTags: string[] = $derived(Array.from(new Set(files.flatMap((f) => f.tags || []))));

  function handleTypeFilterChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value as FilterState["type"];
    onTypeFilter(value);
  }

  function handleStatusFilterChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value as FilterState["status"];
    filters.status = value;
  }

  function handleTagSelect(e: Event) {
    const value = (e.target as HTMLSelectElement).value;
    if (value) {
      filters.tags = [value];
    } else {
      filters.tags = [];
    }
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
      <option value="Approved">Approved</option>
      <option value="Pending">Pending</option>
      <option value="Rejected">Rejected</option>
    </select>

    <select class="rounded-md border border-gray-300 px-3 py-1.5 text-sm" onchange={handleTagSelect} value={filters.tags[0] || ""} disabled={uniqueTags.length === 0}>
      <option value="">Search by tag...</option>
      {#if uniqueTags.length === 0}
        <option value="" disabled>No tags available</option>
      {:else}
        {#each uniqueTags as tag}
          <option value={tag}>{tag}</option>
        {/each}
      {/if}
    </select>
  </div>
</div>
