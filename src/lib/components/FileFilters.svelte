<script lang="ts">
  import type { FilterState, SortConfig, FileItem } from "$lib/types/file";

  let {
    filters,
    sortConfig,
    onTypeFilter,
    onSort,
    files = []
  }: {
    filters: FilterState;
    sortConfig: SortConfig;
    onTypeFilter: (value: FilterState["type"]) => void;
    onSort: (key: keyof FileItem) => void;
    files: FileItem[];
  } = $props();

  // Get unique tags from files
  const uniqueTags: string[] = $derived(Array.from(new Set(files.map((f) => f.tag).filter((tag): tag is string => Boolean(tag)))));

  function handleTypeFilterChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value as FilterState["type"];
    onTypeFilter(value);
  }

  function handleSortChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value as keyof FileItem;
    onSort(value);
  }

  function handleTagSelect(e: Event) {
    const value = (e.target as HTMLSelectElement).value;
    if (value) {
      filters.tags = [value];
    } else {
      filters.tags = [];
    }
  }

  function removeTag(tag: string) {
    filters.tags = filters.tags.filter((t) => t !== tag);
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

    <select class="rounded-md border border-gray-300 px-3 py-1.5 text-sm" onchange={handleSortChange} value={sortConfig.key}>
      <option value="name">Name</option>
      <option value="lastModified">Date</option>
      <option value="size">Size</option>
      <option value="type">Type</option>
      <option value="status">Status</option>
    </select>

    <select class="rounded-md border border-gray-300 px-3 py-1.5 text-sm" onchange={handleTagSelect} value={filters.tags[0] || ""} disabled={uniqueTags.length === 0}>
      <option value="">Tags</option>
      {#each uniqueTags as tag}
        <option value={tag}>{tag}</option>
      {/each}
    </select>
  </div>
</div>
