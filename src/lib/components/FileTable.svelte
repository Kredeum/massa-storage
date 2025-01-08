<script lang="ts">
  import type { FileItem, SortConfig } from "$lib/types/file";
  import { FileText, Image, Video, Music, File, ChevronDown, ChevronUp } from "lucide-svelte";

  type Column = {
    key: keyof FileItem | null;
    label: string;
    sortable: boolean;
  };

  const columns: Column[] = [
    { key: "name", label: "name", sortable: true },
    { key: "size", label: "size", sortable: true },
    { key: "type", label: "type", sortable: true },
    { key: "status", label: "status", sortable: true },
    { key: null, label: "hash", sortable: false }
  ];

  export let files: FileItem[] = [];
  export let selectedFiles: number[] = [];
  export let sortConfig: SortConfig;
  export let handleSort: (key: keyof FileItem) => void;
  let copiedCid: number | null = null;

  function getMockCid(fileId: number): string {
    // Generate a deterministic mock CID for display
    const fullCid = `bafybeih${fileId.toString().padStart(4, "0")}v5jfkqogqfx4xmxjhvgkwrgvk${fileId.toString().padStart(4, "0")}`;
    return `${fullCid.slice(0, 4)}...${fullCid.slice(-4)}`;
  }

  function getFullCid(fileId: number): string {
    // Generate full CID for copying
    return `bafybeih${fileId.toString().padStart(4, "0")}v5jfkqogqfx4xmxjhvgkwrgvk${fileId.toString().padStart(4, "0")}`;
  }

  async function copyToClipboard(fileId: number) {
    try {
      // Copy full CID to clipboard
      await navigator.clipboard.writeText(getFullCid(fileId));
      copiedCid = fileId;
      setTimeout(() => {
        copiedCid = null;
      }, 1000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }

  function getFileIcon(type: string) {
    // Return appropriate icon based on file type
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
        <th class="w-12 px-4 py-3 text-left">
          <input
            type="checkbox"
            class="cursor-pointer rounded text-blue-600"
            onclick={(e) => {
              const target = e.target as HTMLInputElement;
              if (target.checked) {
                selectedFiles = files.map((file) => file.id);
              } else {
                selectedFiles = [];
              }
            }}
          />
        </th>
        {#each columns as column}
          <th
            class="{column.label === 'name'
              ? 'w-1/6 text-left'
              : column.label === 'hash'
                ? 'w-1/5 text-center'
                : column.label === 'size'
                  ? 'w-1/6 text-center'
                  : 'w-1/6 text-center'} px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500"
          >
            <button
              type="button"
              class="flex w-full items-center gap-1 text-xs font-medium uppercase tracking-wider text-gray-500 {column.label === 'hash'
                ? 'cursor-default justify-center'
                : column.sortable
                  ? 'cursor-pointer justify-center hover:text-gray-700'
                  : 'justify-center'}"
              onclick={() => column.key && column.sortable && handleSort(column.key)}
            >
              {column.label}
              {#if column.sortable}
                {#if sortConfig.key === column.key}
                  {#if sortConfig.direction === "desc"}
                    <ChevronDown size={14} class="text-gray-400" />
                  {:else}
                    <ChevronUp size={14} class="text-gray-400" />
                  {/if}
                {:else}
                  <ChevronDown size={14} class="text-gray-400" />
                {/if}
              {/if}
            </button>
          </th>
        {/each}
        <th class="w-32 px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500"> Actions </th>
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
          <td class="w-12 whitespace-nowrap px-4 py-4">
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
          <td class="w-1/6 whitespace-nowrap px-4 py-4">
            <div class="flex items-center gap-2">
              <svelte:component this={getFileIcon(file.type)} size={18} class="text-gray-500" />
              <span class="font-medium text-gray-900">{file.name}</span>
            </div>
          </td>
          <td class="w-1/6 px-4 py-3 text-center text-sm text-gray-500">{file.size}</td>
          <td class="w-1/6 px-4 py-3 text-center text-sm text-gray-500">{file.type}</td>
          <td class="w-1/6 px-4 py-3 text-center">
            <span
              class="inline-flex rounded-full px-2 text-xs font-semibold leading-5"
              class:bg-yellow-100={file.status === "Pending"}
              class:text-yellow-800={file.status === "Pending"}
              class:bg-green-100={file.status === "Approved"}
              class:text-green-800={file.status === "Approved"}
              class:bg-red-100={file.status === "Rejected"}
              class:text-red-800={file.status === "Rejected"}
            >
              {file.status}
            </span>
          </td>
          <td class="w-1/5 whitespace-nowrap px-4 py-4 text-center font-mono text-sm text-gray-500">
            <div class="relative inline-block">
              <button
                class="cursor-pointer text-gray-500 hover:text-gray-700"
                onclick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(file.id);
                }}
              >
                <span class="text-sm">{getMockCid(file.id)}</span>
              </button>
              {#if copiedCid === file.id}
                <span class="absolute left-1/2 -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs text-white"> Copied! </span>
              {/if}
            </div>
          </td>
          <td class="w-32 px-4 py-3 text-center">
            <slot name="actions" {file} />
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
