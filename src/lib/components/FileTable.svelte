<script lang="ts">
  import type { FileItem, SortConfig } from "$lib/types/file";
  import { FileText, Image, Video, Music, File, ChevronDown, ChevronUp } from "lucide-svelte";
  import { onDestroy } from "svelte";

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
    { key: null, label: "cid", sortable: false }
  ];

  export let files: FileItem[] = [];
  export let selectedFiles: number[] = [];
  export let sortConfig: SortConfig;
  export let handleSort: (key: keyof FileItem) => void;
  export let onSelectionChange: (selected: number[]) => void;
  let copiedCid: number | null = null;
  let hoveredCid: number | null = null;
  let hoveredPreview: number | null = null;
  let mouseX = 0;
  let mouseY = 0;
  let previewUrls: { [key: number]: string } = {};

  function getDisplayCid(file: FileItem): string {
    if (!file.cid) return "N/A";
    return `${file.cid.slice(0, 4)}...${file.cid.slice(-4)}`;
  }

  function getPreviewUrl(file: FileItem): string {
    if (!file.blob) return "";
    if (!previewUrls[file.id]) {
      previewUrls[file.id] = URL.createObjectURL(file.blob);
    }
    return previewUrls[file.id];
  }

  async function copyToClipboard(fileId: number) {
    try {
      const file = files.find((f) => f.id === fileId);
      if (!file?.cid) return;

      await navigator.clipboard.writeText(file.cid);
      copiedCid = fileId;
      setTimeout(() => {
        copiedCid = null;
      }, 1000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  }

  function handleMouseMove(event: MouseEvent) {
    mouseX = event.clientX;
    mouseY = event.clientY;
  }

  onDestroy(() => {
    Object.values(previewUrls).forEach((url) => {
      URL.revokeObjectURL(url);
    });
  });
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
              const newSelected = target.checked ? files.map((file) => file.id) : [];
              selectedFiles = newSelected;
              onSelectionChange(newSelected);
            }}
          />
        </th>
        {#each columns as column}
          <th
            class="{column.label === 'name'
              ? 'w-1/6 text-left'
              : column.label === 'cid'
                ? 'w-1/5 text-center'
                : column.label === 'size'
                  ? 'w-1/6 text-center'
                  : 'w-1/6 text-center'} px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500"
          >
            <button
              type="button"
              class="flex w-full items-center gap-1 text-xs font-medium uppercase tracking-wider text-gray-500 {column.label === 'cid'
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
            const newSelected = selectedFiles.includes(file.id) ? selectedFiles.filter((id) => id !== file.id) : [...selectedFiles, file.id];
            onSelectionChange(newSelected);
          }}
        >
          <td class="w-12 whitespace-nowrap px-4 py-4">
            <input
              type="checkbox"
              class="cursor-pointer rounded text-blue-600"
              checked={selectedFiles.includes(file.id)}
              onchange={() => {
                const newSelected = selectedFiles.includes(file.id) ? selectedFiles.filter((id) => id !== file.id) : [...selectedFiles, file.id];
                onSelectionChange(newSelected);
              }}
            />
          </td>
          <td class="relative whitespace-nowrap px-4 py-2 text-sm">
            <div class="flex items-center">
              <div class="flex h-5 w-5 items-center justify-center">
                {#if file.type === "image"}
                  <Image class="h-5 w-5 text-blue-500" />
                {:else if file.type === "video"}
                  <Video class="h-5 w-5 text-purple-500" />
                {:else if file.type === "sound"}
                  <Music class="h-5 w-5 text-green-500" />
                {:else}
                  <FileText class="h-5 w-5 text-gray-500" />
                {/if}
              </div>
              <div
                class="ml-4 cursor-pointer"
                role="button"
                tabindex="0"
                onmouseenter={() => {
                  if (file.type === "image" || file.type === "video") {
                    hoveredPreview = file.id;
                  }
                }}
                onmouseleave={() => {
                  hoveredPreview = null;
                }}
                onmousemove={handleMouseMove}
              >
                <div class="font-medium text-gray-900">
                  {file.name}
                </div>
              </div>
            </div>
            {#if hoveredPreview === file.id && file.blob}
              <div class="pointer-events-none fixed z-50" style="left: {mouseX - 64}px; top: {mouseY - 140}px;">
                <div class="rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
                  {#if file.type === "image"}
                    <img src={getPreviewUrl(file)} alt={file.name} class="h-32 w-32 rounded object-cover" />
                  {:else if file.type === "video"}
                    <video src={getPreviewUrl(file)} class="h-32 w-32 rounded object-cover" autoplay muted loop playsinline disablePictureInPicture>
                      <track kind="captions" src="" label="Captions" default />
                    </video>
                  {:else if file.type === "document"}
                    <div class="flex h-32 w-32 flex-col items-center justify-center rounded bg-gray-100 p-2 text-center">
                      <FileText class="h-8 w-8 text-gray-500" />
                      <div class="mt-2 max-w-full truncate text-xs text-gray-600">
                        {file.name}
                      </div>
                      {#if file.mimeType}
                        <div class="text-xs text-gray-400">
                          {file.mimeType.split("/")[1].toUpperCase()}
                        </div>
                      {/if}
                    </div>
                  {/if}
                </div>
              </div>
            {/if}
          </td>
          <td class="w-1/6 px-4 py-3 text-center text-sm text-gray-500">{file.size}</td>
          <td class="w-1/6 px-4 py-3 text-center text-sm text-gray-500">{file.type}</td>
          <td class="w-1/6 px-4 py-3 text-center">
            <span
              class="inline-flex min-w-[80px] justify-center rounded-full px-2 text-xs font-semibold leading-5"
              class:bg-yellow-100={file.status === "Pending"}
              class:text-yellow-800={file.status === "Pending"}
              class:bg-green-100={file.status === "Approved"}
              class:text-green-800={file.status === "Approved"}
              class:bg-red-100={file.status === "Rejected" || file.status === "Error"}
              class:text-red-800={file.status === "Rejected" || file.status === "Error"}
            >
              {file.status}
            </span>
          </td>
          <td class="w-1/5 whitespace-nowrap px-4 py-4 text-center font-mono text-sm text-gray-500">
            <div class="relative inline-block">
              {#if file.cid}
                <button
                  class="relative cursor-pointer"
                  onclick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(file.id);
                  }}
                  onmouseenter={() => {
                    hoveredCid = file.id;
                  }}
                  onmouseleave={() => {
                    hoveredCid = null;
                  }}
                >
                  <span class="text-sm">{getDisplayCid(file)}</span>
                </button>
                {#if hoveredCid === file.id}
                  <span class="absolute -top-1.5 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-gray-600 px-2 py-1 text-xs text-white">
                    {file.cid}
                  </span>
                {/if}
                {#if copiedCid === file.id}
                  <span class="absolute left-1/2 -translate-x-1/2 rounded-md bg-gray-600 px-2 py-1 text-xs text-white"> Copied! </span>
                {/if}
              {:else}
                <span class="text-gray-400">N/A</span>
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
