<script lang="ts">
  import type { FileItem } from '$lib/types/file';

  export let files: FileItem[] = [];
  export let selectedFiles: number[] = [];

  function handleSort(column: 'name' | 'size' | 'type') {
    const event = new CustomEvent('sort', { detail: column });
    dispatchEvent(event);
  }

  function handleSelect(id: number) {
    if (selectedFiles.includes(id)) {
      selectedFiles = selectedFiles.filter((fileId: number) => fileId !== id);
    } else {
      selectedFiles = [...selectedFiles, id];
    }
    const event = new CustomEvent('select', { detail: id });
    dispatchEvent(event);
  }

  function handleSelectAll() {
    const event = new CustomEvent('selectAll', { detail: files });
    dispatchEvent(event);
  }

  function getFileIcon(type: string): string {
    switch (type) {
      case 'document':
        return '📄';
      case 'image':
        return '🖼️';
      case 'video':
        return '🎥';
      case 'sound':
        return '🎵';
      default:
        return '📁';
    }
  }
</script>

<div class="overflow-x-auto">
  <table class="min-w-full divide-y divide-gray-200">
    <thead class="bg-gray-50">
      <tr>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          <input
            type="checkbox"
            class="rounded text-blue-600"
            checked={selectedFiles.length === files.length}
            onclick={() => handleSelectAll()}
          />
        </th>
        {#each ['name', 'size', 'type'] as column}
          <th
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
            onclick={() => handleSort(column as 'name' | 'size' | 'type')}
          >
            <div class="flex items-center gap-2">
              {column}
              <span class="text-gray-400">↓</span>
            </div>
          </th>
        {/each}
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Status
        </th>
        <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center w-32">
          Actions
        </th>
      </tr>
    </thead>
    <tbody class="bg-white divide-y divide-gray-200">
      {#each files as file}
        <tr 
          class="hover:bg-gray-50 cursor-pointer"
          onclick={() => handleSelect(file.id)}
        >
          <td class="px-6 py-4 whitespace-nowrap">
            <input
              type="checkbox"
              class="rounded text-blue-600"
              checked={selectedFiles.includes(file.id)}
              onclick={(e) => { e.stopPropagation(); handleSelect(file.id); }}
              onchange={() => handleSelect(file.id)}
            />
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center gap-2">
              <span>{getFileIcon(file.type)}</span>
              <span>{file.name}</span>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">{file.size}</td>
          <td class="px-6 py-4 whitespace-nowrap">{file.type}</td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
              ${file.status === 'Approved' ? 'bg-green-100 text-green-800' : ''}
              ${file.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
              ${file.status === 'Rejected' ? 'bg-red-100 text-red-800' : ''}`}
            >
              {file.status}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <slot name="actions" file={file} />
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
