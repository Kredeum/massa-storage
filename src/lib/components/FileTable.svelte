<script lang="ts">
  import type { FileItem } from "$lib/types/file";
  import { FileText, Image, Video, Music, File, ChevronDown } from "lucide-svelte";

  export let files: FileItem[] = [];
  export let selectedFiles: number[] = [];
  let copiedCid: number | null = null;

  function getMockCid(fileId: number): string {
    // Generate shorter deterministic CIDv1 mock for each file with ellipsis
    const fullCid = `bafybeih${fileId.toString().padStart(4, "0")}v5jfkqogqfx4xmxjhvgkwrgvk${fileId.toString().padStart(4, "0")}`;
    return `${fullCid.slice(0, 8)}...${fullCid.slice(-4)}`;
  }

  function getFullCid(fileId: number): string {
    return `bafybeih${fileId.toString().padStart(4, "0")}v5jfkqogqfx4xmxjhvgkwrgvk${fileId.toString().padStart(4, "0")}`;
  }

  async function copyToClipboard(fileId: number) {
    try {
      await navigator.clipboard.writeText(getFullCid(fileId));
      copiedCid = fileId;
      setTimeout(() => {
        copiedCid = null;
      }, 1000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }

  function handleSort(column: "name" | "hash" | "size" | "type" | "status") {
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
        {#each ["name", "hash", "size", "type"] as column}
          <th
            class="{column === 'name'
              ? 'w-1/6 text-left'
              : column === 'hash'
                ? 'w-1/5 text-center'
                : column === 'size'
                  ? 'w-1/6 text-center'
                  : 'w-1/6 text-center'} px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500"
          >
            <button
              type="button"
              class="flex w-full items-center gap-1 text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700 {column === 'name' ? '' : 'justify-center'}"
              onclick={() => handleSort(column as "name" | "hash" | "size" | "type")}
            >
              {column}
              <ChevronDown size={14} class="text-gray-400" />
            </button>
          </th>
        {/each}
        <th class="w-32 px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
          <button
            type="button"
            class="flex w-full items-center justify-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700"
            onclick={() => handleSort("status")}
          >
            Status
            <ChevronDown size={14} class="text-gray-400" />
          </button>
        </th>
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
          <td class="w-1/5 whitespace-nowrap px-4 py-4 text-center font-mono text-sm text-gray-500">
            <div class="relative inline-block">
              <button
                class="hover:text-gray-900"
                onclick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(file.id);
                }}
                title="Click to copy full CID"
              >
                <span>{getMockCid(file.id)}</span>
              </button>
              {#if copiedCid === file.id}
                <span class="absolute left-full ml-2 text-green-600 text-xs whitespace-nowrap">
                  Copied!
                </span>
              {/if}
            </div>
          </td>
          <td class="w-1/6 whitespace-nowrap px-4 py-4 text-center">
            {file.size}
          </td>
          <td class="w-1/6 whitespace-nowrap px-4 py-4 text-center">
            <span>{file.type}</span>
          </td>
          <td class="w-32 whitespace-nowrap px-4 py-4 text-center">
            <span
              class="inline-flex rounded-full px-2 text-xs font-semibold leading-5
              {file.status === 'Approved' ? 'bg-green-100 text-green-800' : file.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}"
            >
              {file.status}
            </span>
          </td>
          <td class="w-32 whitespace-nowrap px-4 py-4">
            <slot name="actions" {file} />
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
