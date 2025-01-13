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
  import { toastStore } from "../stores/toast";

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  // Global state
  let currentPage = $state(0);
  const itemsPerPage = 20;
  let files = $state<FileItem[]>([]);
  let selectedFiles = $state<number[]>([]);
  let searchQuery = $state("");
  let uploadFiles = $state<FileList | undefined>();
  let filters: FilterState = $state({
    type: "all",
    status: "all"
  });

  let sortConfig: SortConfig = $state({
    key: "lastModified",
    direction: "desc"
  });

  function getFileType(mimeType: string): FileType {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "sound";
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

  $effect(() => {
    if (uploadFiles) {
      const newFiles: FileItem[] = Array.from(uploadFiles)
        .filter((file) => {
          if (file.size > MAX_FILE_SIZE) {
            toastStore.add(`File ${file.name} exceeds maximum size of ${formatSize(MAX_FILE_SIZE)}`, "error");
            return false;
          }
          return true;
        })
        .map((file) => ({
          id: Date.now() + Math.random(),
          name: file.name,
          size: formatSize(file.size),
          type: getFileType(file.type),
          status: "Pending" as const,
          isPinned: false,
          lastModified: new Date(file.lastModified).toISOString(),
          blob: file,
          mimeType: file.type
        }));

      files = [...files, ...newFiles];
      if (newFiles.length > 0) {
        toastStore.add(`Successfully added ${newFiles.length} file${newFiles.length > 1 ? "s" : ""}`, "success");
      }
      uploadFiles = undefined; // Reset after processing
    }
  });

  // Reactive filtering and sorting
  const filteredFiles = $derived(
    files.filter((file) => {
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filters.type === "all" || file.type === filters.type;
      const matchesStatus = filters.status === "all" || file.status === filters.status;
      return matchesSearch && matchesType && matchesStatus;
    })
  );

  const sortedFiles = $derived(
    [...filteredFiles].sort((a, b) => {
      const direction = sortConfig.direction === "asc" ? 1 : -1;

      if (sortConfig.key === "name") {
        return direction * a.name.localeCompare(b.name);
      }

      if (sortConfig.key === "size") {
        const aSize = parseFloat(a.size);
        const bSize = parseFloat(b.size);
        return direction * (bSize - aSize);
      }

      if (sortConfig.key === "type" || sortConfig.key === "status") {
        return direction * a[sortConfig.key].localeCompare(b[sortConfig.key]);
      }

      // Default (lastModified)
      return direction * (new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
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

  function handleSearchChange(query: string) {
    searchQuery = query;
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
  <div class="mb-6 space-y-4">
    <div class="mb-8">
      <FileUpload bind:files={uploadFiles} />
    </div>
    <div class="flex items-center justify-between gap-4">
      <div class="flex flex-1 items-center gap-4">
        <SearchBar bind:searchTerm={searchQuery} />
        {#if selectedFiles.length > 0}
          <FileSelectionBar selectedCount={selectedFiles.length} onApprove={handleBulkApprove} onReject={handleBulkReject} onPin={handleBulkPin} />
        {/if}
      </div>
      <FileFilters {filters} {sortConfig} onTypeFilter={handleTypeFilter} onSort={handleSort} />
    </div>
  </div>

  <FileTable files={paginatedFiles} {selectedFiles} {sortConfig} {handleSort} onSelectionChange={handleSelectionChange}>
    {#snippet actions({ file })}
      
        <FileActions {file} onModerate={handleModeration} onPin={handlePin} />
      
      {/snippet}
  </FileTable>

  <FilePagination {currentPage} {totalPages} {itemsPerPage} totalItems={filteredFiles.length} setPage={(page) => setPage(page)} />
</div>
