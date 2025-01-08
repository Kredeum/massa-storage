<script lang="ts">
  import type { FileItem } from "$lib/types/file";
  import { FileText, Image, Video, Music, File, ChevronDown } from "lucide-svelte";

  export let files: FileItem[] = [];
  export let selectedFiles: number[] = [];

  function handleSort(column: "name" | "size" | "type" | "status") {
    const event = new CustomEvent("sort", { detail: column });
    dispatchEvent(event);
  }

  function getFileIcon(type: string) {
    switch (type) {
      case "document":
        return FileText;
      case "image":
        return Image;
      case "video":
        return Video;
      case "sound":
        return Music;
      default:
        return File;
    }
  }
</script>

<div class="overflow-x-auto">
  <table class="min-w-full divide-y divide-gray-200">
    <thead class="bg-gray-50">
      <tr>
        <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
          <input
            type="checkbox"
            class="cursor-pointer rounded text-blue-600"
            checked={selectedFiles.length === files.length && files.length > 0}
            onclick={(e) => {
              e.stopPropagation();
              if (selectedFiles.length === files.length) {
                selectedFiles = [];
              } else {
                selectedFiles = files.map((file) => file.id);
              }
            }}
          />
        </th>
        {#each ["name", "size", "type"] as column}
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            <button
              type="button"
              class="flex w-fit items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700"
              onclick={() => handleSort(column as "name" | "size" | "type")}
            >
              {column}
              <ChevronDown size={14} class="text-gray-400" />
            </button>
          </th>
        {/each}
        <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
          <button type="button" class="flex w-fit items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700" onclick={() => handleSort("status")}>
            Status
            <ChevronDown size={14} class="text-gray-400" />
          </button>
        </th>
        <th class="w-32 px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500"> Actions </th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-200 bg-white">
      {#each files as file}
        <tr
          class="cursor-pointer hover:bg-gray-50"
          onclick={() => {
            if (selectedFiles.includes(file.id)) {
              selectedFiles = selectedFiles.filter((id) => id !== file.id);
            } else {
              selectedFiles = [...selectedFiles, file.id];
            }
          }}
        >
          <td class="whitespace-nowrap px-6 py-4">
            <input
              type="checkbox"
              class="cursor-pointer rounded text-blue-600"
              checked={selectedFiles.includes(file.id)}
              onclick={(e) => {
                e.stopPropagation();
                if (selectedFiles.includes(file.id)) {
                  selectedFiles = selectedFiles.filter((id) => id !== file.id);
                } else {
                  selectedFiles = [...selectedFiles, file.id];
                }
              }}
            />
          </td>
          <td class="whitespace-nowrap px-6 py-4">
            <div class="flex items-center">
              <span>{file.name}</span>
            </div>
          </td>
          <td class="whitespace-nowrap px-6 py-4">{file.size}</td>
          <td class="whitespace-nowrap px-6 py-4">
            <div class="flex items-center gap-2">
              <svelte:component this={getFileIcon(file.type)} size={18} class="text-gray-500" />
              <span>{file.type}</span>
            </div>
          </td>
          <td class="whitespace-nowrap px-6 py-4">
            <span
              class="inline-flex rounded-full px-2 text-xs font-semibold leading-5
              {file.status === 'Approved' ? 'bg-green-100 text-green-800' : ''}
              {file.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
              {file.status === 'Rejected' ? 'bg-red-100 text-red-800' : ''}"
            >
              {file.status}
            </span>
          </td>
          <td class="whitespace-nowrap px-6 py-4">
            <slot name="actions" {file} />
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
