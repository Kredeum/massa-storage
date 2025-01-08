<script lang="ts">
  import type { FileItem, FilterState, SortConfig } from "$lib/types/file";
  import SearchBar from "./SearchBar.svelte";
  import FileFilters from "./FileFilters.svelte";
  import FileTable from "./FileTable.svelte";
  import FileActions from "./FileActions.svelte";
  import FilePagination from "./FilePagination.svelte";
  import FileUpload from "./FileUpload.svelte";

  // Function to generate random mock data
  function generateMockData(count: number): FileItem[] {
    const types = ["document", "image", "video", "sound"] as const;
    const statuses = ["Pending", "Approved", "Rejected"] as const;
    const extensions = {
      document: ".pdf",
      image: [".jpg", ".png", ".gif"],
      video: [".mp4", ".mov", ".avi"],
      sound: [".mp3", ".wav", ".ogg"]
    };

    return Array.from({ length: count }, (_, i) => {
      const type = types[Math.floor(Math.random() * types.length)];
      const ext = Array.isArray(extensions[type]) ? extensions[type][Math.floor(Math.random() * extensions[type].length)] : extensions[type];

      return {
        id: i + 1,
        name: `File ${i + 1}${ext}`,
        size: `${Math.floor(Math.random() * 100)}.${Math.floor(Math.random() * 9)}MB`,
        type,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        isPinned: Math.random() > 0.8,
        lastModified: new Date(2024, 0, Math.floor(Math.random() * 31) + 1).toISOString().split("T")[0]
      };
    }).reverse();
  }

  // Global state
  let currentPage = $state(0);
  const itemsPerPage = 20;
  const totalItems = 100;

  let files = $state(generateMockData(totalItems));
  let selectedFiles: number[] = $state([]);
  let searchQuery = $state("");
  let filters: FilterState = $state({
    type: "all",
    status: "all"
  });

  let sortConfig: SortConfig = $state({
    key: "name",
    direction: "desc"
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

      // Pour "name", on garde le tri par ID inversé
      if (sortConfig.key === "name") {
        return direction * (Number(a.id) - Number(b.id));
      }

      // Pour "size", on convertit en nombres
      if (sortConfig.key === "size") {
        const aSize = parseFloat(a.size);
        const bSize = parseFloat(b.size);
        return direction * (bSize - aSize) || direction * (Number(a.id) - Number(b.id));
      }

      // Pour "type" et "status", tri alphabétique
      if (sortConfig.key === "type" || sortConfig.key === "status") {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        const comparison = aValue.localeCompare(bValue);
        return comparison !== 0 ? direction * comparison : direction * (Number(a.id) - Number(b.id));
      }

      // Par défaut (id), tri chronologique inversé
      return direction * (Number(a.id) - Number(b.id));
    })
  );

  const paginatedFiles = $derived(sortedFiles.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage));

  const totalPages = $derived(Math.ceil(sortedFiles.length / itemsPerPage));

  // Actions
  function handleSort(key: keyof FileItem) {
    if (key === sortConfig.key) {
      // Si même colonne, on inverse juste la direction
      sortConfig = {
        key,
        direction: sortConfig.direction === "desc" ? "asc" : "desc"
      };
    } else {
      // Nouvelle colonne, on met la direction par défaut
      sortConfig = {
        key,
        direction: "desc"
      };
    }
  }

  function handleCheckbox(e: CustomEvent<number>) {
    const fileId = e.detail;
    selectedFiles = selectedFiles.includes(fileId) ? selectedFiles.filter((id) => id !== fileId) : [...selectedFiles, fileId];
  }

  function handlePin(id: number) {
    files = files.map((file) => (file.id === id ? { ...file, isPinned: !file.isPinned } : file));
  }

  function handleModeration(data: { id: number; status: FileItem["status"] }) {
    files = files.map((file) => (file.id === data.id ? { ...file, status: data.status } : file));
  }

  function handleSearchChange(query: string) {
    searchQuery = query;
  }

  function handleFilterChange(e: CustomEvent<{ type: string; value: string }>) {
    const { type, value } = e.detail;
    filters = {
      ...filters,
      [type]: value
    };
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

  function handleFilesSelected(newFiles: FileItem[]) {
    files = [...files, ...newFiles];
  }
</script>

<div class="mx-auto max-w-7xl rounded-lg bg-white p-6 shadow-lg">
  <div class="mb-6 space-y-4">
    <div class="mb-8">
      <FileUpload onFilesSelected={handleFilesSelected} />
    </div>
    <div class="flex items-center justify-between">
      <SearchBar searchTerm={searchQuery} onSearch={handleSearchChange} />
      <FileFilters {filters} {sortConfig} onTypeFilter={handleTypeFilter} onSort={handleSort} />
    </div>
  </div>

  <FileTable files={paginatedFiles} {selectedFiles}>
    <svelte:fragment slot="actions" let:file>
      <FileActions {file} onModerate={handleModeration} onPin={handlePin} />
    </svelte:fragment>
  </FileTable>

  <FilePagination {currentPage} {totalPages} {itemsPerPage} totalItems={filteredFiles.length} setPage={(page) => setPage(page)} />
</div>
