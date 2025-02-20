<script lang="ts">
  import { getContext, onMount } from "svelte";
  import { createKuboClient } from "$lib/ts/kubo";
  import type { FileItem } from "$lib/ts/types";
  import { formatDate, getFileTypeFromName } from "$lib/ts/utils";
  import FileTable from "../fileTable/FileTable.svelte";
  import FilePagination from "./FilePagination.svelte";
  import SearchBar from "./SearchBar.svelte";
  import { FilterStore } from "$lib/runes/FilterStore.svelte";
  import type { Ipfs } from "$lib/runes/ipfs.svelte";
  import { STATUS_PENDING, STATUS_APPROVED } from "@kredeum/massa-storage-common/src/constants";

  const { collectionCid = null } = $props<{ collectionCid?: string | null }>();

  let files = $state<FileItem[]>([]);
  let filteredFiles = $state<FileItem[]>([]);
  let currentPage = $state(1);
  let itemsPerPage = $state(10);
  let paginatedFiles = $state<FileItem[]>([]);
  let selectedFiles = $state<string[]>([]);

  type SortConfig = {
    key: keyof FileItem;
    direction: "asc" | "desc";
  };

  let sortConfig = $state<SortConfig>({
    key: "name",
    direction: "asc"
  });

  const filterStore = new FilterStore();
  const kubo = createKuboClient();
  const ipfs: Ipfs = getContext("ipfs");

  const loadFiles = async () => {
    if (!ipfs) return;

    try {
      if (!collectionCid) {
        // Load files from specific collection
        const collectionFiles = await kubo.ls(collectionCid);
        const loadedFiles: FileItem[] = [];

        for await (const file of collectionFiles) {
          loadedFiles.push({
            cid: file.cid.toString(),
            name: file.name,
            sizeInBytes: file.size,
            type: getFileTypeFromName(file.name),
            status: STATUS_PENDING,
            isPinned: false,
            uploadDate: new Date().toISOString(),
            tags: []
          });
        }

        files = loadedFiles;
      } else {
        // Load all files
        await ipfs.cidsGet();
        const collectionCids = ipfs.cids;
        const loadedFiles: FileItem[] = [];

        for (const [collectionCid, attributes] of collectionCids.entries()) {
          if (!collectionCid || !attributes) continue;

          try {
            const fileList = await kubo.ls(collectionCid);
            for await (const file of fileList) {
              loadedFiles.push({
                cid: file.cid.toString(),
                name: file.name,
                sizeInBytes: file.size,
                type: getFileTypeFromName(file.name),
                uploadDate: attributes.date,
                status: attributes.status === "1" ? STATUS_APPROVED : STATUS_PENDING,
                isPinned: false,
                tags: []
              });
            }
          } catch (error) {
            console.error(`Error loading files for CID ${collectionCid}:`, error);
          }
        }

        files = loadedFiles;
      }

      updateFilters();
    } catch (error) {
      console.error("Error loading files:", error);
    }
  };

  const handleSort = (key: keyof FileItem) => {
    if (sortConfig.key === key) {
      sortConfig.direction = sortConfig.direction === "asc" ? "desc" : "asc";
    } else {
      sortConfig = {
        key,
        direction: "asc"
      };
    }
    updateFilters();
  };

  const handleSelectionChange = (selectedIds: string[]) => {
    selectedFiles = selectedIds;
  };

  const updateFilters = () => {
    // Apply search filter
    let filtered = files.filter((file) => {
      const searchLower = filterStore.searchQuery.toLowerCase();
      return file.name.toLowerCase().includes(searchLower);
    });

    // Apply sort
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      const direction = sortConfig.direction === "asc" ? 1 : -1;

      // Si une des valeurs est undefined, la mettre à la fin
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;
      if (aValue === bValue) return 0;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue) * direction;
      }
      if (aValue < bValue) return -1 * direction;
      if (aValue > bValue) return 1 * direction;
      return 0;
    });

    filteredFiles = filtered;
    updatePagination();
  };

  const updatePagination = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    paginatedFiles = filteredFiles.slice(startIndex, endIndex);
  };

  function setPage(page: number) {
    currentPage = page;
    updatePagination();
  }

  $effect(() => {
    if (filterStore.searchQuery !== undefined) {
      updateFilters();
    }
  });

  onMount(() => {
    loadFiles();
  });
</script>

<div class="flex flex-col gap-4">
  <div class="flex items-center justify-between">
    <SearchBar bind:searchTerm={filterStore.searchQuery} />
  </div>

  <!-- File Table -->
  <FileTable {files} {paginatedFiles} {sortConfig} {handleSort} {selectedFiles} onSelectionChange={handleSelectionChange} onFilterChange={() => {}} actions={undefined} {filteredFiles} />

  <div class="mt-4">
    <FilePagination {currentPage} totalPages={Math.ceil(filteredFiles.length / itemsPerPage)} {itemsPerPage} totalItems={filteredFiles.length} {setPage} />
  </div>
</div>
