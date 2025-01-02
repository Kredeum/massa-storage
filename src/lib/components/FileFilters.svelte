<script lang="ts">
  import type { Filters, SortConfig } from '$lib/types';

  export let filters: Filters;
  export let sortConfig: SortConfig;
  export let ontypefilter: (types: string[]) => void;
  export let onsizefilter: (size: string | [number, number]) => void;
  export let onsort: (key: 'name' | 'size' | 'type') => void;
</script>

<div class="flex space-x-4">
  <div class="flex items-center space-x-2">
    <span class="text-gray-500">📁</span>
    <select
      class="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={filters.type.length > 0 ? filters.type[0] : ""}
      onchange={e => ontypefilter((e.target as HTMLSelectElement).value ? [ (e.target as HTMLSelectElement).value ] : [])}
    >
      <option value="">All Types</option>
      <option value="document">Document</option>
      <option value="image">Image</option>
      <option value="video">Video</option>
    </select>
  </div>
  <div class="flex items-center space-x-2">
    <span class="text-gray-500">↕️</span>
    <select
      class="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      onchange={e => onsort((e.target as HTMLSelectElement).value as 'name' | 'size' | 'type')}
      value={sortConfig.key}
    >
      <option value="name">Name</option>
      <option value="size">Size</option>
      <option value="type">Type</option>
    </select>
  </div>
  <div class="flex items-center space-x-2">
    <select
      class="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={filters.size.length > 0 ? filters.size[0] : ""}
      onchange={e => onsizefilter((e.target as HTMLSelectElement).value)}
    >
      <option value="">All Sizes</option>
      <option value="small">Small (&lt;1MB)</option>
      <option value="medium">Medium (1-10MB)</option>
      <option value="large">Large (&gt;10MB)</option>
    </select>
  </div>
</div>
