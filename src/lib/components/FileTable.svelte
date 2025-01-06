<script lang="ts">
  import type { FileItem, SortConfig } from '$lib/types/file';

  export let files: FileItem[];
  export let selectedFiles: number[];
  export let sortConfig: SortConfig;
  export let onSort: (key: 'name' | 'size' | 'type') => void;
  export let onCheckbox: (id: number) => void;
  export let onSelectAll: (files: FileItem[]) => void;
  export let onModerate: (id: number, action: 'Approved' | 'Rejected') => void;

  let isModerator = true;
</script>

<div class="overflow-x-auto">
  <table class="w-full">
    <thead class="bg-gray-50">
      <tr>
        <th class="w-[52px] px-4 py-2">
          <div class="flex items-center">
            <input
              type="checkbox"
              checked={selectedFiles.length === files.length}
              onchange={() => onSelectAll(files)}
              class="rounded text-blue-500 focus:ring-blue-500 cursor-pointer"
              aria-label="Select all files"
            />
          </div>
        </th>
        <th
          class="px-4 py-2 cursor-pointer"
          onclick={() => onSort("name")}
        >
          <div class="flex items-center space-x-1">
            <span>File Name</span>
            {#if sortConfig.key === "name"}
              <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
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
              <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
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
              <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
            {/if}
          </div>
        </th>
        {#if isModerator}
          <th class="px-4 py-2">Actions</th>
        {/if}
      </tr>
    </thead>
    <tbody>
      {#each files as file (file.id)}
        <tr
          class="border-b hover:bg-gray-50 transition-colors cursor-pointer"
          onclick={() => onCheckbox(file.id)}
        >
          <td class="w-[52px] px-4 py-2">
            <div class="flex items-center">
              <input
                type="checkbox"
                checked={selectedFiles.includes(file.id)}
                onchange={() => onCheckbox(file.id)}
                class="rounded text-blue-500 focus:ring-blue-500"
                onclick={(e) => e.stopPropagation()}
              />
            </div>
          </td>
          <td class="px-4 py-2">{file.name}</td>
          <td class="px-4 py-2">{file.size}</td>
          <td class="px-4 py-2">{file.type}</td>
          {#if isModerator}
            <td class="px-4 py-2">
              <div class="flex items-center justify-center space-x-4">
                <button
                  onclick={() => onModerate(file.id, 'Approved')}
                  class="text-green-600 hover:text-green-900 disabled:opacity-50"
                  disabled={file.status === 'Approved'}
                >
                  Approve
                </button>
                <button
                  onclick={() => onModerate(file.id, 'Rejected')}
                  class="text-red-600 hover:text-red-900 disabled:opacity-50"
                  disabled={file.status === 'Rejected'}
                >
                  Reject
                </button>
              </div>
            </td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
