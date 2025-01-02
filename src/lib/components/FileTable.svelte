<script lang="ts">
  import type { File, SortConfig } from '$lib/types';
  import { getFileIcon, formatFileSize } from '$lib/utils';
  import { ICONS } from '$lib/constants';

  export let files: File[];
  export let selectedFiles: number[];
  export let sortConfig: SortConfig;
  export let onSort: (key: 'name' | 'size' | 'type') => void;
  export let onCheckbox: (id: number) => void;
  export let onSelectAll: (files: File[]) => void;
</script>

<div class="overflow-x-auto">
  <table class="w-full">
    <thead>
      <tr class="bg-gray-50">
        <th class="px-4 py-2">
          <label class="cursor-pointer">
            <input
              type="checkbox"
              checked={selectedFiles.length === files.length}
              onchange={() => onSelectAll(files)}
              class="rounded text-blue-500 focus:ring-blue-500"
              aria-label="Select all files"
            />
          </label>
        </th>
        <th
          class="px-4 py-2 cursor-pointer"
          onclick={() => onSort("name")}
        >
          <div class="flex items-center space-x-1">
            <span>File Name</span>
            {#if sortConfig.key === "name"}
              <span>{sortConfig.direction === "asc" ? ICONS.SORT_ASC : ICONS.SORT_DESC}</span>
            {/if}
          </div>
        </th>
        <th
          class="px-4 py-2 cursor-pointer"
          onclick={() => onSort("size")}
        >
          <div class="flex items-center space-x-1">
            <span>Size</span>
            {#if sortConfig.key === "size"}
              <span>{sortConfig.direction === "asc" ? ICONS.SORT_ASC : ICONS.SORT_DESC}</span>
            {/if}
          </div>
        </th>
        <th
          class="px-4 py-2 cursor-pointer"
          onclick={() => onSort("type")}
        >
          <div class="flex items-center space-x-1">
            <span>Type</span>
            {#if sortConfig.key === "type"}
              <span>{sortConfig.direction === "asc" ? ICONS.SORT_ASC : ICONS.SORT_DESC}</span>
            {/if}
          </div>
        </th>
      </tr>
    </thead>
    <tbody>
      {#each files as file (file.id)}
        <tr 
          class="border-b hover:bg-gray-50 transition-colors cursor-pointer" 
          onclick={() => onCheckbox(file.id)}
        >
          <td class="px-4 py-2">
            <label class="cursor-pointer">
              <input
                type="checkbox"
                checked={selectedFiles.includes(file.id)}
                onchange={() => onCheckbox(file.id)}
                class="rounded text-blue-500 focus:ring-blue-500"
              />
            </label>
          </td>
          <td class="px-4 py-2">
            <div class="flex items-center space-x-2">
              <span>{getFileIcon(file.type)}</span>
              <span>{file.name}</span>
            </div>
          </td>
          <td class="px-4 py-2">{formatFileSize(file.size)}</td>
          <td class="px-4 py-2 capitalize">{file.type}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
