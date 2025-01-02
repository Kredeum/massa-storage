<script lang="ts">
  import type { Filters } from '$lib/types';

  export let filters: Filters;
  export let onTypeFilter: (type: string) => void;
  export let onSizeFilter: (size: string) => void;
</script>

<div class="flex flex-col gap-4 items-start w-full max-w-2xl mx-auto px-4 mb-8">
  <div class="w-full grid grid-cols-4 gap-4 items-center">
    <span class="font-semibold w-24">File Type:</span>
    <label class="flex items-center gap-2 w-32 cursor-pointer">
      <input
        type="checkbox"
        checked={filters.type.includes("document")}
        onchange={() => onTypeFilter("document")}
        class="rounded text-blue-500 focus:ring-blue-500 cursor-pointer"
      />
      <span class="cursor-pointer">Document</span>
    </label>
    <label class="flex items-center gap-2 w-32 cursor-pointer">
      <input
        type="checkbox"
        checked={filters.type.includes("image")}
        onchange={() => onTypeFilter("image")}
        class="rounded text-blue-500 focus:ring-blue-500 cursor-pointer"
      />
      <span class="cursor-pointer">Image</span>
    </label>
    <label class="flex items-center gap-2 w-32 cursor-pointer">
      <input
        type="checkbox"
        checked={filters.type.includes("video")}
        onchange={() => onTypeFilter("video")}
        class="rounded text-blue-500 focus:ring-blue-500 cursor-pointer"
      />
      <span class="cursor-pointer">Video</span>
    </label>
  </div>

  <div class="w-full grid grid-cols-4 gap-4 items-center">
    <span class="font-semibold w-24">File Size:</span>
    <label class="flex items-center gap-2 w-32 cursor-pointer">
      <input
        type="checkbox"
        checked={filters.size.includes("small")}
        onchange={() => onSizeFilter("small")}
        class="rounded text-blue-500 focus:ring-blue-500 cursor-pointer"
      />
      <span class="cursor-pointer">Small</span>
    </label>
    <label class="flex items-center gap-2 w-32 cursor-pointer">
      <input
        type="checkbox"
        checked={filters.size.includes("medium")}
        onchange={() => onSizeFilter("medium")}
        class="rounded text-blue-500 focus:ring-blue-500 cursor-pointer"
      />
      <span class="cursor-pointer">Medium</span>
    </label>
    <label class="flex items-center gap-2 w-32 cursor-pointer">
      <input
        type="checkbox"
        checked={filters.size.includes("large")}
        onchange={() => onSizeFilter("large")}
        class="rounded text-blue-500 focus:ring-blue-500 cursor-pointer"
      />
      <span class="cursor-pointer">Large</span>
    </label>
  </div>
</div>
