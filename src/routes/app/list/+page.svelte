<script lang="ts">
  import SearchBar from '$lib/components/SearchBar.svelte';
  import FileFilters from '$lib/components/FileFilters.svelte';
  import FileTable from '$lib/components/FileTable.svelte';
  import type { File, Filters, SortConfig } from '$lib/types';

  const mockFiles = [
    { id: 1, name: "Document1.pdf", size: 1024, type: "document" },
    { id: 2, name: "Image1.jpg", size: 2048, type: "image" },
    { id: 3, name: "Video1.mp4", size: 5120, type: "video" },
    { id: 4, name: "Document2.docx", size: 512, type: "document" },
    { id: 5, name: "Image2.png", size: 1536, type: "image" },
  ];

  let files = $state(mockFiles);
  let selectedFiles: number[] = $state([]);
  let sortConfig = $state<SortConfig>({ key: null, direction: "asc" });
  let searchTerm = $state("");
  let filters = $state<Filters>({
    type: [],
    size: [],
  });

  let filteredFiles = $derived(() => {
    let result = [...mockFiles];

    if (searchTerm) {
      result = result.filter((file) =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.type.length > 0) {
      result = result.filter((file) => filters.type.includes(file.type));
    }

    if (filters.size.length > 0) {
      result = result.filter((file) => {
        if (filters.size.includes("small") && file.size < 1024) return true;
        if (filters.size.includes("medium") && file.size >= 1024 && file.size < 5120)
          return true;
        if (filters.size.includes("large") && file.size >= 5120) return true;
        return false;
      });
    }

    if (sortConfig.key !== null) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];
        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  });

  function handleSort(key: 'name' | 'size' | 'type') {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    sortConfig = { key, direction };
  }

  function handleCheckbox(id: number) {
    selectedFiles = selectedFiles.includes(id)
      ? selectedFiles.filter((fileId) => fileId !== id)
      : [...selectedFiles, id];
  }

  function handleTypeFilter(type: string) {
    filters = {
      ...filters,
      type: filters.type.includes(type)
        ? filters.type.filter((t) => t !== type)
        : [...filters.type, type],
    };
  }

  function handleSizeFilter(size: string) {
    filters = {
      ...filters,
      size: filters.size.includes(size)
        ? filters.size.filter((s) => s !== size)
        : [...filters.size, size],
    };
  }

  function handleSelectAll(files: File[]) {
    selectedFiles = selectedFiles.length === files.length
      ? []
      : files.map((file) => file.id);
  }
</script>

<div class="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
  <div class="mb-6">
    <SearchBar bind:searchTerm />
  </div>

  <FileFilters
    {filters}
    onTypeFilter={handleTypeFilter}
    onSizeFilter={handleSizeFilter}
  />

  <FileTable
    files={filteredFiles()}
    {selectedFiles}
    {sortConfig}
    onSort={handleSort}
    onCheckbox={handleCheckbox}
    onSelectAll={handleSelectAll}
  />
</div>
