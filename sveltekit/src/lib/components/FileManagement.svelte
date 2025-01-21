<script lang="ts">
  import type { FileItem, FilterState, SortConfig, FileStatus, FileType } from "$lib/types/file";
  import SearchBar from "./SearchBar.svelte";
  import FileFilters from "./FileFilters.svelte";
  import FileTable from "./FileTable.svelte";
  import FileActions from "./FileActions.svelte";
  import FileUpload from "./FileUpload.svelte";
  import FileSelectionBar from "./FileSelectionBar.svelte";
  import FilePagination from "./FilePagination.svelte";
  import Toast from "./Toast.svelte";
  import TagInput from "./TagInput.svelte";
  import { toastStore } from "../stores/toast";
  import { createKuboClient } from "$lib/ts/kubo";
  import { onMount } from "svelte";

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  // Global state
  let currentPage = $state(0);
  const itemsPerPage = 20;
  let files = $state<FileItem[]>([]);
  let selectedFiles = $state<number[]>([]);
  let searchQuery = $state("");
  let uploadFiles = $state<FileList | undefined>();
  let cid = $state<string>("");

  let kubo: ReturnType<typeof createKuboClient>;

  let filters: FilterState = $state({
    type: "all",
    status: "all",
    tags: []
  });

  let sortConfig: SortConfig = $state({
    key: "lastModified",
    direction: "desc"
  });

  function getFileType(mimeType: string): FileType {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    return "document";
  }

  function formatSize(bytes: number): string {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  onMount(async () => {
    try {
      kubo = createKuboClient();
    } catch (error) {
      console.error(error);
      toastStore.error("Failed to access IPFS server. Please check your connection.");
    }
  });

  $effect(() => {
    if (uploadFiles) {
      (async () => {
        const newFiles: FileItem[] = await Promise.all(
          Array.from(uploadFiles)
            .filter((file) => {
              if (file.size > MAX_FILE_SIZE) {
                toastStore.add(`File ${file.name} exceeds maximum size of ${formatSize(MAX_FILE_SIZE)}`, "error");
                return false;
              }
              return true;
            })
            .map(async (file) => {
              const arrayBuffer = await file.arrayBuffer();
              console.log("arrayBuffer:", arrayBuffer);

              const mimeType = file.type;
              console.log("mimeType:", mimeType);

              const content = new Uint8Array(arrayBuffer);
              console.log("content:", content);

              console.log("kubo:", kubo.addAndPin);

              try {
                const result = await kubo.addAndPin(content);
                if (result) {
                  cid = result.toString();
                  console.log("CID:", cid);
                } else {
                  console.error("Result from addAndPin is undefined");
                  toastStore.error("Failed to add and pin file. Unexpected result from IPFS.");
                }
              } catch (error) {
                console.error("Error in addAndPin:", error);
                toastStore.error("Failed to add and pin file. IPFS operation error.");
              }

              const fileType = getFileType(mimeType);
              return {
                id: Date.now() + Math.random(),
                name: file.name,
                size: formatSize(file.size),
                sizeInBytes: file.size,
                type: fileType,
                tags: [],
                status: "Pending",
                isPinned: false,
                lastModified: new Date(file.lastModified).toISOString(),
                blob: file,
                mimeType,
                cid: cid,
                arrayBuffer: arrayBuffer,
                file
              };
            })
        );
        files = [...files, ...newFiles];
        if (newFiles.length > 0) {
          toastStore.add(`Successfully added ${newFiles.length} file${newFiles.length > 1 ? "s" : ""}`, "success");
        }
        uploadFiles = undefined;
      })();
    }
  });

  // Reactive filtering and sorting
  const filteredFiles = $derived(
    files.filter((file) => {
      const matchesType = filters.type === "all" || file.type === filters.type;
      const matchesStatus = filters.status === "all" || file.status === filters.status;
      const matchesTags = filters.tags.length === 0 || (file.tags && file.tags.some((tag) => filters.tags.includes(tag)));
      const matchesSearch = !searchQuery || file.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesStatus && matchesTags && matchesSearch;
    })
  );

  const sortedFiles = $derived(
    [...filteredFiles].sort((a, b) => {
      if (sortConfig.key === "lastModified") {
        const dateA = new Date(a.lastModified).getTime();
        const dateB = new Date(b.lastModified).getTime();
        return sortConfig.direction === "desc" ? dateB - dateA : dateA - dateB;
      }

      if (sortConfig.key === "name") {
        return sortConfig.direction === "asc" ? b.name.toLowerCase().localeCompare(a.name.toLowerCase()) : a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      }

      if (sortConfig.key === "size") {
        return sortConfig.direction === "asc" ? b.sizeInBytes - a.sizeInBytes : a.sizeInBytes - b.sizeInBytes;
      }

      const direction = sortConfig.direction === "desc" ? 1 : -1;
      return direction * String(a[sortConfig.key]).localeCompare(String(b[sortConfig.key]));
    })
  );

  const paginatedFiles = $derived(sortedFiles.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage));

  const totalPages = $derived(Math.ceil(sortedFiles.length / itemsPerPage));

  // Actions
  function handleSort(key: keyof FileItem) {
    if (sortConfig.key === key) {
      sortConfig.direction = sortConfig.direction === "asc" ? "desc" : "asc";
    } else {
      sortConfig = { key, direction: "desc" };
    }
  }

  function handlePin(id: number) {
    // Toggle pin status
    files = files.map((file) => (file.id === id ? { ...file, isPinned: !file.isPinned } : file));
  }

  function handleModeration(data: { id: number; status: FileStatus }) {
    // Update file status based on moderation action
    files = files.map((file) => (file.id === data.id ? { ...file, status: data.status } : file));
  }

  function handleTypeFilter(value: FilterState["type"]) {
    filters = {
      ...filters,
      type: value
    };
  }

  function setPage(page: number) {
    currentPage = page;
  }

  function handleSelectionChange(selected: number[]) {
    selectedFiles = selected;
  }

  function handleAddTag(tag: string, fileIds: number[]) {
    if (fileIds.length === 0) return;

    files = files.map((file) => (fileIds.includes(file.id) ? { ...file, tags: [...file.tags, tag] } : file));
    // Reset selection after adding tags
    selectedFiles = [];
  }

  function handleFilterChange(status: FileStatus | "all") {
    filters.status = status;
    currentPage = 0; // Reset to first page when filter changes
  }

  // Bulk actions
  function handleBulkApprove() {
    files = files.map((file) => (selectedFiles.includes(file.id) ? { ...file, status: "Approved" } : file));
    selectedFiles = [];
  }

  function handleBulkReject() {
    files = files.map((file) => (selectedFiles.includes(file.id) ? { ...file, status: "Rejected" } : file));
    selectedFiles = [];
  }

  function handleBulkPin() {
    files = files.map((file) => (selectedFiles.includes(file.id) ? { ...file, isPinned: true } : file));
    selectedFiles = [];
  }
</script>

<Toast />

<div class="mx-auto max-w-7xl rounded-lg bg-white p-6 shadow-lg">
  <div class="mb-6 flex flex-col gap-4">
    <div class="mb-8">
      <FileUpload bind:files={uploadFiles} />
    </div>
    <div class="flex items-center justify-between gap-4">
      <div class="flex flex-1 items-center gap-4">
        <SearchBar bind:searchTerm={searchQuery} />
        <TagInput {selectedFiles} {files} onAddTag={handleAddTag} />
        {#if selectedFiles.length > 0}
          <FileSelectionBar selectedCount={selectedFiles.length} onApprove={handleBulkApprove} onReject={handleBulkReject} onPin={handleBulkPin} />
        {/if}
      </div>
      <FileFilters {filters} {sortConfig} {files} onTypeFilter={handleTypeFilter} onSort={handleSort} />
    </div>
  </div>

  <FileTable {files} {paginatedFiles} {selectedFiles} {sortConfig} {handleSort} onSelectionChange={handleSelectionChange} onFilterChange={handleFilterChange} {filteredFiles}>
    {#snippet actions(file)}
      <FileActions {file} onModerate={handleModeration} onPin={handlePin} />
    {/snippet}
  </FileTable>

  <FilePagination {currentPage} {totalPages} {itemsPerPage} totalItems={filteredFiles.length} setPage={(page) => setPage(page)} />
</div>
