<script lang="ts">
  import type { FileItem, SortConfig, FileStatus } from "$lib/types/file";
  import { FileText, Image, Video, Music, ChevronDown, ChevronUp } from "lucide-svelte";
  import { onDestroy, onMount } from "svelte";
  import { storeFileForPreview } from "$lib/stores/filePreviewStore";

  type Column = {
    // eslint-disable-next-line no-unused-vars
    key: keyof FileItem | null;
    label: string;
    sortable: boolean;
  };

  const columns: Column[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "tags", label: "Tags", sortable: false },
    { key: "lastModified", label: "Date", sortable: true },
    { key: "size", label: "Size", sortable: true },
    { key: "type", label: "Type", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: null, label: "CID", sortable: false }
  ];

  interface Props {
    files: FileItem[];
    paginatedFiles: FileItem[];
    selectedFiles?: number[];
    sortConfig: SortConfig;
    handleSort: (key: keyof FileItem) => void;
    onSelectionChange: (selected: number[]) => void;
    onFilterChange: (status: FileStatus | "all") => void;
    actions?: import("svelte").Snippet<[FileItem]>;
    filteredFiles?: FileItem[];
  }

  let { files = [], paginatedFiles = [], selectedFiles = $bindable([]), sortConfig, handleSort, onSelectionChange, onFilterChange, actions, filteredFiles = [] }: Props = $props();

  let copiedCid: number | null = $state(null);
  let hoveredCid: number | null = $state(null);
  let hoveredPreview: number | null = $state(null);
  let mouseX = $state(0);
  let mouseY = $state(0);
  let previewUrls: { [key: number]: string } = {};
  let showSelectionMenu = $state(false);
  let menuRef = $state<HTMLDivElement | null>(null);
  let buttonRef = $state<HTMLButtonElement | null>(null);

  function getDisplayCid(file: FileItem): string {
    if (!file.cid) return "N/A";
    return `${file.cid.slice(0, 6)}...${file.cid.slice(-4)}`;
  }

  function getPreviewUrl(file: FileItem): string {
    if (!file.blob) return "";
    if (!previewUrls[file.id]) {
      previewUrls[file.id] = URL.createObjectURL(file.blob);
    }
    return previewUrls[file.id];
  }

  function handleFileClick(event: MouseEvent | KeyboardEvent, file: FileItem) {
    event.stopPropagation(); // Prevent row selection
    if (!file.blob) return;

    // If Ctrl/Cmd is pressed, download directly
    if ((event as MouseEvent).ctrlKey || (event as MouseEvent).metaKey) {
      const link = document.createElement("a");
      link.href = getPreviewUrl(file);
      link.download = file.name;
      link.click();
    } else {
      // Store the file for preview and open in new tab
      storeFileForPreview(file.id.toString(), {
        blob: file.blob,
        name: file.name,
        type: file.type
      });
      window.open(`/preview/${file.id}`, "_blank");
    }
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

  // Select all files across all pages
  function handleSelectAll() {
    const allFileIds = files.map((file) => file.id);
    selectedFiles = allFileIds;
    onSelectionChange(allFileIds);
    showSelectionMenu = false;
  }

  // Select only files visible on the current page
  function handleSelectCurrentPage() {
    const currentPageIds = paginatedFiles.map((file) => file.id);
    selectedFiles = currentPageIds;
    onSelectionChange(currentPageIds);
    showSelectionMenu = false;
  }

  // Select approved files from the current view
  function handleSelectApprovedFiles() {
    // Select approved files and update filter
    const approvedFiles = files.filter((file) => file.status === "Approved");
    const approvedIds = approvedFiles.map((file) => file.id);
    selectedFiles = approvedIds;
    onSelectionChange(approvedIds);
    onFilterChange("Approved");
    showSelectionMenu = false;
  }

  // Select pending files from the current view
  function handleSelectPendingFiles() {
    // Select pending files and update filter
    const pendingFiles = files.filter((file) => file.status === "Pending");
    const pendingIds = pendingFiles.map((file) => file.id);
    selectedFiles = pendingIds;
    onSelectionChange(pendingIds);
    onFilterChange("Pending");
    showSelectionMenu = false;
  }

  function handleClearSelection() {
    selectedFiles = [];
    onSelectionChange([]);
    onFilterChange("all"); // Réinitialiser le filtre
    showSelectionMenu = false;
  }

  function handleClickOutside(event: MouseEvent) {
    if (showSelectionMenu && menuRef && !menuRef.contains(event.target as Node) && !buttonRef?.contains(event.target as Node)) {
      showSelectionMenu = false;
    }
  }

  onMount(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  });

  onDestroy(() => {
    Object.values(previewUrls).forEach((url) => {
      URL.revokeObjectURL(url);
    });
  });
</script>

<div class="relative">
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="relative w-12 px-4 py-3 text-left">
            <div class="relative flex items-center gap-0.5">
              <input
                type="checkbox"
                class="cursor-pointer rounded text-blue-600"
                checked={selectedFiles.length > 0 && paginatedFiles.every((file) => selectedFiles.includes(file.id))}
                onclick={(e) => {
                  const target = e.target as HTMLInputElement;
                  const newSelected = target.checked
                    ? [...selectedFiles, ...paginatedFiles.map((file) => file.id).filter((id) => !selectedFiles.includes(id))]
                    : selectedFiles.filter((id) => !paginatedFiles.some((file) => file.id === id));
                  selectedFiles = newSelected;
                  onSelectionChange(newSelected);
                }}
                aria-label="Select all files on current page"
              />
              <button
                bind:this={buttonRef}
                class="rounded hover:bg-gray-100"
                onclick={(e) => {
                  e.stopPropagation();
                  showSelectionMenu = !showSelectionMenu;
                }}
                aria-expanded={showSelectionMenu}
                aria-haspopup="true"
                aria-label="Selection menu"
              >
                <ChevronDown size={16} />
              </button>
            </div>
          </th>
          {#each columns as column}
            <th
              class="{column.key === 'name'
                ? 'w-1/6 text-left'
                : column.key === 'tags'
                  ? 'w-1/6 text-center'
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
              <div class="flex w-full {column.key === 'name' ? 'justify-start' : 'justify-center'}">
                <button
                  class="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider {column.key === 'tags'
                    ? 'cursor-default text-gray-500'
                    : `text-gray-500 ${column.sortable ? 'hover:text-gray-700' : ''} ${!column.sortable ? 'cursor-default' : ''}`}"
                  onclick={() => column.key && column.sortable && handleSort(column.key)}
                >
                  <span>{column.label}</span>
                  {#if column.sortable && column.key !== "tags"}
                    <span class="ml-1">
                      {#if sortConfig.key === column.key}
                        {#if sortConfig.direction === "desc"}
                          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        {:else}
                          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                        {/if}
                      {:else}
                        <svg class="h-3.5 w-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M4 12h16" />
                        </svg>
                      {/if}
                    </span>
                  {/if}
                </button>
              </div>
            </th>
          {/each}
          <th class="w-32 px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500"> Actions </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 bg-white">
        {#each paginatedFiles as file}
          <tr
            class="cursor-pointer hover:bg-gray-50"
            onclick={() => {
              const newSelected = selectedFiles.includes(file.id) ? selectedFiles.filter((id) => id !== file.id) : [...selectedFiles, file.id];
              selectedFiles = newSelected;
              onSelectionChange(newSelected);
            }}
            onkeydown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                const newSelected = selectedFiles.includes(file.id) ? selectedFiles.filter((id) => id !== file.id) : [...selectedFiles, file.id];
                selectedFiles = newSelected;
                onSelectionChange(newSelected);
              }
            }}
            role="button"
            tabindex="0"
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
                  selectedFiles = newSelected;
                  onSelectionChange(newSelected);
                }}
                onkeydown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    const target = e.target as HTMLInputElement;
                    const newSelected = !target.checked ? [...selectedFiles, file.id] : selectedFiles.filter((id) => id !== file.id);
                    selectedFiles = newSelected;
                    onSelectionChange(newSelected);
                  }
                }}
                aria-label={`Select ${file.name}`}
              />
            </td>
            {#each columns as column}
              {#if column.key === "name"}
                <td class="w-2/6 whitespace-nowrap px-4 py-4">
                  <div class="flex items-center">
                    {#if file.type === "image"}
                      <Image class="mr-2 h-5 w-5 text-blue-500" />
                    {:else if file.type === "video"}
                      <Video class="mr-2 h-5 w-5 text-purple-500" />
                    {:else if file.type === "audio"}
                      <Music class="mr-2 h-5 w-5 text-green-500" />
                    {:else}
                      <FileText class="mr-2 h-5 w-5 text-gray-500" />
                    {/if}
                    <a
                      href={file.blob ? URL.createObjectURL(file.blob) : "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="font-medium text-gray-900 hover:text-blue-600"
                      onmousemove={handleMouseMove}
                      onmouseenter={() => {
                        if (file.type === "image" || file.type === "video") {
                          hoveredPreview = file.id;
                        }
                      }}
                      onmouseleave={() => {
                        hoveredPreview = null;
                      }}
                      onclick={(e) => {
                        if (file.blob) {
                          const url = URL.createObjectURL(file.blob);
                          window.open(url, "_blank");
                          // Clean up the URL after opening
                          setTimeout(() => URL.revokeObjectURL(url), 100);
                        }
                      }}
                    >
                      {file.name}
                    </a>

                    <a
                      href={file.blob ? URL.createObjectURL(file.blob) : "#"}
                      download={file.name}
                      class="ml-2 text-sm text-gray-500 hover:text-blue-600"
                      aria-label={`Download ${file.name}`}
                      onclick={(e) => {
                        if (file.blob) {
                          const url = URL.createObjectURL(file.blob);
                          (e.target as HTMLAnchorElement).href = url;
                          // Clean up the URL after download starts
                          setTimeout(() => URL.revokeObjectURL(url), 100);
                        }
                      }}
                    >
                    </a>

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
              {:else if column.key === "tags"}
                <td class="w-1/6 px-4 py-4 text-center text-sm">
                  <div class="flex flex-wrap justify-center gap-1">
                    {#each file.tags || [] as tag}
                      <span class="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                        {tag}
                      </span>
                    {/each}
                  </div>
                </td>
              {:else if column.key === "lastModified"}
                <td class="w-1/6 px-4 py-4 text-center text-sm text-gray-500">
                  {new Date(file.lastModified).toLocaleDateString()}
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
                        : 'bg-yellow-100 text-yellow-800'}"
                  >
                    {file.status}
                  </span>
                </td>
              {:else}
                <td class="w-1/6 whitespace-nowrap px-4 py-4 text-center font-mono text-sm text-gray-500">
                  <div class="relative">
                    <button
                      class="rounded px-2 py-1 hover:bg-gray-100"
                      onmouseenter={() => (hoveredCid = file.id)}
                      onmouseleave={() => (hoveredCid = null)}
                      onclick={() => copyToClipboard(file.id)}
                      onkeydown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          copyToClipboard(file.id);
                        }
                      }}
                      aria-label={`Copy CID for ${file.name}`}
                    >
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

  {#if showSelectionMenu && buttonRef}
    <div
      bind:this={menuRef}
      class="fixed w-44 rounded-md border border-gray-200 bg-white py-0.5 shadow-lg"
      role="menu"
      tabindex="-1"
      style="left: {buttonRef.getBoundingClientRect().right}px; top: {buttonRef.getBoundingClientRect().top}px; z-index: 9999;"
    >
      <button
        type="button"
        class="w-full cursor-pointer px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
        onclick={(e) => {
          e.stopPropagation();
          handleSelectAll();
        }}
        role="menuitem"
      >
        Select All
      </button>
      <button
        type="button"
        class="w-full cursor-pointer px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
        onclick={(e) => {
          e.stopPropagation();
          handleSelectCurrentPage();
        }}
        role="menuitem"
      >
        Select All On Page
      </button>
      <button
        type="button"
        class="w-full cursor-pointer px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
        onclick={(e) => {
          e.stopPropagation();
          handleSelectApprovedFiles();
        }}
        role="menuitem"
      >
        Select All Approved
      </button>
      <button
        type="button"
        class="w-full cursor-pointer px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
        onclick={(e) => {
          e.stopPropagation();
          handleSelectPendingFiles();
        }}
        role="menuitem"
      >
        Select All Pending
      </button>
      <div class="my-0.5 border-t border-gray-200"></div>
      <button
        type="button"
        class="w-full cursor-pointer px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
        onclick={(e) => {
          e.stopPropagation();
          handleClearSelection();
        }}
        role="menuitem"
      >
        Clear selection
      </button>
    </div>
  {/if}
</div>
