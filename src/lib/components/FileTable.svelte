<script lang="ts">
  import type { FileItem, SortConfig } from "$lib/types/file";
  import { FileText, Image, Video, Music, ChevronDown, ChevronUp } from "lucide-svelte";
  import { onDestroy } from "svelte";

  type Column = {
    // eslint-disable-next-line no-unused-vars
    key: keyof FileItem | null;
    label: string;
    sortable: boolean;
  };

  const columns: Column[] = [
    { key: "name", label: "name", sortable: true },
    { key: "lastModified", label: "date", sortable: true },
    { key: "size", label: "size", sortable: true },
    { key: "type", label: "type", sortable: true },
    { key: "status", label: "status", sortable: true },
    { key: null, label: "cid", sortable: false }
  ];

  interface Props {
    files?: FileItem[];
    selectedFiles?: number[];
    sortConfig: SortConfig;
    handleSort: (key: keyof FileItem) => void;
    onSelectionChange: (selected: number[]) => void;
    actions?: import("svelte").Snippet<[FileItem]>;
  }

  let { files = [], selectedFiles = $bindable([]), sortConfig, handleSort, onSelectionChange, actions }: Props = $props();
  let copiedCid: number | null = $state(null);
  let hoveredCid: number | null = $state(null);
  let hoveredPreview: number | null = $state(null);
  let mouseX = $state(0);
  let mouseY = $state(0);
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
            class="{column.key === 'name'
              ? 'w-1/6 text-left'
              : column.key === 'lastModified'
                ? 'w-1/6 text-center'
                : column.key === 'size'
                  ? 'w-1/12 text-center'
                  : column.key === 'type'
                    ? 'w-1/12 text-center'
                    : column.key === 'status'
                      ? 'w-1/12 text-center'
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
              onclick={(e: MouseEvent) => {
                e.stopPropagation();
                const target = e.target as HTMLInputElement;
                const newSelected = target.checked ? [...selectedFiles, file.id] : selectedFiles.filter((id) => id !== file.id);
                onSelectionChange(newSelected);
              }}
            />
          </td>
          {#each columns as column}
            {#if column.key === "name"}
              <td class="w-2/6 whitespace-nowrap px-4 py-4">
                <div
                  class="flex items-center"
                  role="button"
                  tabindex="0"
                  onmousemove={handleMouseMove}
                  onmouseenter={() => {
                    if (file.type === "image" || file.type === "video") {
                      hoveredPreview = file.id;
                    }
                  }}
                  onmouseleave={() => {
                    hoveredPreview = null;
                  }}
                >
                  {#if file.type === "image"}
                    <Image class="mr-2 h-5 w-5 text-blue-500" />
                  {:else if file.type === "video"}
                    <Video class="mr-2 h-5 w-5 text-purple-500" />
                  {:else if file.type === "audio"}
                    <Music class="mr-2 h-5 w-5 text-green-500" />
                  {:else}
                    <FileText class="mr-2 h-5 w-5 text-gray-500" />
                  {/if}
                  <span class="font-medium text-gray-900">{file.name}</span>
                  {#if hoveredPreview === file.id && (file.type === "image" || file.type === "video")}
                    <div class="pointer-events-none fixed z-50" style="left: {mouseX - 64}px; top: calc({mouseY - 136}px);">
                      <div class="rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
                        {#if file.type === "image"}
                          <img src={getPreviewUrl(file)} alt={file.name} class="h-32 w-32 rounded object-cover" />
                        {:else if file.type === "video"}
                          <video src={getPreviewUrl(file)} class="h-32 w-32 rounded bg-black object-contain" autoplay muted loop playsinline>
                            <track kind="captions" label="No captions available" src="data:text/vtt,WEBVTT" />
                          </video>
                        {/if}
                      </div>
                    </div>
                  {/if}
                </div>
              </td>
            {:else if column.key === "lastModified"}
              <td class="w-1/6 px-4 py-4 text-center text-sm text-gray-500">
                {new Date(file.lastModified).toLocaleString()}
              </td>
            {:else if column.key === "size"}
              <td class="w-1/12 px-4 py-4 text-center text-sm text-gray-500">
                {file.size}
              </td>
            {:else if column.key === "type"}
              <td class="w-1/12 px-4 py-4 text-center text-sm text-gray-500">
                {file.type}
              </td>
            {:else if column.key === "status"}
              <td class="w-1/12 px-4 py-4 text-center">
                <span
                  class="inline-flex rounded-full px-2 text-xs font-semibold leading-5 {file.status === 'Approved'
                    ? 'bg-green-100 text-green-800'
                    : file.status === 'Rejected'
                      ? 'bg-red-100 text-red-800'
                      : file.status === 'Error'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'}"
                >
                  {file.status}
                </span>
              </td>
            {:else}
              <td class="w-1/6 whitespace-nowrap px-4 py-4 text-center font-mono text-sm text-gray-500">
                <div class="relative">
                  <button class="rounded px-2 py-1 hover:bg-gray-100" onmouseenter={() => (hoveredCid = file.id)} onmouseleave={() => (hoveredCid = null)} onclick={() => copyToClipboard(file.id)}>
                    {getDisplayCid(file)}
                  </button>
                </div>
              </td>
            {/if}
          {/each}
          <td class="w-32 px-4 py-3 text-center">
            {@render actions?.(file)}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
