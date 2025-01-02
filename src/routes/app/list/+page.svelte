<script lang="ts">
  import { onMount } from 'svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import FileFilters from '$lib/components/FileFilters.svelte';
  import FileTable from '$lib/components/FileTable.svelte';
  import type { File, Filters, SortConfig } from '$lib/types';

  let error = $state<string | null>(null);
  let loading = $state(false);

  const mockFiles: File[] = [
    { id: 1, name: "Document1.pdf", size: 1024, type: "document", status: "pending" },
    { id: 2, name: "Image1.jpg", size: 2048, type: "image", status: "pending" },
    { id: 3, name: "Video1.mp4", size: 5120, type: "video", status: "pending" },
    { id: 4, name: "Document2.docx", size: 512, type: "document", status: "pending" },
    { id: 5, name: "Image2.png", size: 1536, type: "image", status: "pending" },
  ];

  let files = $state(mockFiles);
  let searchTerm = $state("");
  let selectedFiles = $state<number[]>([]);
  let sortConfig = $state<SortConfig>({ key: 'name', direction: 'asc' });
  let filters = $state<Filters>({
    type: [],
    size: []
  });

  onMount(() => {
    try {
      // Initial data is already loaded since we're using mock data
      loading = false;
    } catch (e) {
      error = "Failed to load files. Please try again later.";
      loading = false;
    }
  });

  function computeFilteredFiles(files: File[], searchTerm: string, filters: Filters, sortConfig: SortConfig): File[] {
    let result = [...files];
    
    if (searchTerm) {
      result = result.filter(file => 
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filters
    if (filters.type.length > 0) {
      result = result.filter(file => filters.type.includes(file.type));
    }

    // Apply size filters
    if (filters.size.length > 0) {
      result = result.filter(file => filters.size.some(range => {
        if (!Array.isArray(range)) return false;
        const [min, max] = range;
        return file.size >= Number(min) && file.size <= Number(max);
      }));
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const modifier = sortConfig.direction === 'asc' ? 1 : -1;
        
        if (sortConfig.key === 'name') {
          return a.name.localeCompare(b.name) * modifier;
        } else if (sortConfig.key === 'size') {
          return (a.size - b.size) * modifier;
        } else {
          return a.type.localeCompare(b.type) * modifier;
        }
      });
    }

    return result;
  }

  let computedFiles: () => File[] = $derived(() => {
    try {
      return computeFilteredFiles(files, searchTerm, filters, sortConfig);
    } catch (e) {
      error = "Error filtering files. Please check your filters and try again.";
      return files;
    }
  });

  let filteredFiles: () => File[] = $derived(computedFiles);

  function handleSort(newSortConfig: SortConfig) {
    try {
    sortConfig = newSortConfig;
    } catch (e) {
      error = "Failed to sort files. Please try again.";
    }
  }

  function handleFileSort(key: keyof File) {
    sortConfig = {
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    };
  }

  function handleSearch(event: CustomEvent<{ value: string }>) {
    searchTerm = event.detail.value;
  }

  function handleCheckbox(id: number) {
    try {
      selectedFiles = selectedFiles.includes(id)
        ? selectedFiles.filter(fileId => fileId !== id)
        : [...selectedFiles, id];
    } catch (e) {
      error = "Failed to select file. Please try again.";
    }
  }

  function handleSelectAll(files: File[]) {
    try {
      // If all files are currently selected, deselect all
      // Otherwise, select all files
      if (selectedFiles.length === files.length) {
        selectedFiles = [];
      } else {
        selectedFiles = files.map(file => file.id);
      }
    } catch (e) {
      error = "Failed to select files. Please try again.";
    }
  }

  function handleTypeFilter(types: string[]) {
    try {
      filters = {
        ...filters,
        type: types
      };
    } catch (e) {
      error = "Failed to apply type filter. Please try again.";
    }
  }

  function handleSizeFilter(size: string | [number, number]) {
    try {
      let sizeFilter: (string | [number, number])[];
      
      if (typeof size === 'string') {
        if (!size) {
          sizeFilter = [];
        } else {
          // Convert string size filters to number ranges
          switch (size) {
            case 'small':
              sizeFilter = [[0, 1024 * 1024]]; // 0-1MB
              break;
            case 'medium':
              sizeFilter = [[1024 * 1024, 10 * 1024 * 1024]]; // 1MB-10MB
              break;
            case 'large':
              sizeFilter = [[10 * 1024 * 1024, Number.MAX_SAFE_INTEGER]]; // >10MB
              break;
            default:
              sizeFilter = [];
          }
        }
      } else {
        sizeFilter = [size];
      }
      
      filters = {
        ...filters,
        size: sizeFilter
      };
    } catch (e) {
      error = "Failed to apply size filter. Please try again.";
    }
  }

  function handleModeration(fileId: number, action: 'approved' | 'rejected') {
    try {
      files = files.map(file =>
        file.id === fileId ? { ...file, status: action } : file
      );
    } catch (e) {
      error = "Failed to moderate file. Please try again.";
    }
  }

  async function handlePinFiles() {
    if (loading) return;
    
    try {
      loading = true;
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      files = files.map(file => 
        selectedFiles.includes(file.id) 
          ? { ...file, status: 'pinned' } 
          : file
      );
      
      selectedFiles = [];
    } catch (e) {
      error = "Failed to pin files. Please try again.";
    } finally {
      loading = false;
    }
  }

  function clearError() {
    error = null;
  }
</script>

<div class="min-h-screen bg-gray-100 p-8">
  <div class="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
    {#if error}
      <div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
        <div class="flex items-center justify-between">
          <span class="text-red-700">{error}</span>
          <button 
            class="text-red-500 hover:text-red-700"
            onclick={clearError}
          >
            ✕
          </button>
        </div>
      </div>
    {/if}

    <div class="mb-6 space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800">File Management</h1>
        <SearchBar 
          {searchTerm}
          onsearch={handleSearch}
        />
      </div>

      <FileFilters
        filters={filters}
        sortConfig={sortConfig}
        ontypefilter={handleTypeFilter}
        onsizefilter={handleSizeFilter}
        onsort={handleFileSort}
      />
    </div>

    {#if loading}
      <div class="flex justify-center items-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    {:else}
      <FileTable
        files={filteredFiles()}
        selectedFiles={selectedFiles}
        sortConfig={sortConfig}
        onSort={handleFileSort}
        onCheckbox={handleCheckbox}
        onSelectAll={handleSelectAll}
        onModerate={handleModeration}
      />

      {#if selectedFiles.length > 0}
        <div class="mt-4 p-4 bg-blue-50 rounded-lg">
          <div class="flex items-center justify-between">
            <span class="text-sm text-blue-700">
              {selectedFiles.length} files selected
            </span>
            <button
              class="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              onclick={handlePinFiles}
              disabled={loading}
            >
              {#if loading}
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {:else}
                📌
              {/if}
              <span>Pin Selected Files</span>
            </button>
          </div>
        </div>
      {/if}
    {/if}
  </div>
</div>
