<script lang="ts">
  import { getContext, onMount } from "svelte";
  import { createKuboClient } from "$lib/ts/kubo";
  import { STATUS_PENDING } from "@kredeum/massa-storage-common/src/constants";

  import SearchBar from "./SearchBar.svelte";
  import FileFilters from "./FileFilters.svelte";
  import FileTable from "../fileTable/FileTable.svelte";
  import ButtonActions from "$lib/components/common/ButtonActions.svelte";

  import FilePagination from "./FilePagination.svelte";

  import { FileStore } from "$lib/runes/FileStore.svelte";
  import { FilterStore } from "$lib/runes/FilterStore.svelte";

  import type { FileItem } from "$lib/ts/types";
  import { formatDate, getFileTypeFromName } from "$lib/ts/utils";
  import all from "it-all";

  import { Ipfs } from "$lib/runes/ipfs.svelte";

  const { collectionCid = null } = $props<{ collectionCid?: string | null }>();

  let kubo: ReturnType<typeof createKuboClient>;
  const fileStore = new FileStore();
  const filterStore = new FilterStore();
  const ipfs: Ipfs = getContext("ipfs");

  onMount(async () => {
    kubo = await createKuboClient();
    await loadFiles();
  });

  const loadFiles = async () => {
    if (!ipfs || !collectionCid) return;

    try {
      const files = await kubo.ls(collectionCid);
      for await (const file of files) {
        const type = getFileTypeFromName(file.name);
        let blob;
        const chunks = await all(kubo.cat(file.cid.toString()));
        const content = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        for (const chunk of chunks) {
          content.set(chunk, offset);
          offset += chunk.length;
        }

        const mimeTypes = {
          image: "image/*",
          video: "video/*",
          audio: "audio/*",
          document: "application/pdf"
        };

        blob = new Blob([content], { type: mimeTypes[type] || "application/octet-stream" });

        const fileItem: FileItem = {
          cid: file.cid.toString(),
          name: file.name,
          sizeInBytes: file.size,
          status: STATUS_PENDING,
          isPinned: false,
          arrayBuffer: undefined,
          type,
          blob
        };

        fileStore.files.push(fileItem);
      }
    } catch (error) {
      console.error(`Error loading files from collection ${collectionCid}:`, error);
    }
  };

  const filteredFiles = $derived(filterStore.filterFiles(fileStore.files));
  const sortedFiles = $derived(filterStore.sortFiles(filteredFiles));
  const paginatedFiles = $derived(filterStore.getPaginatedFiles(sortedFiles));
  const totalPages = $derived(filterStore.getTotalPages(filteredFiles));
</script>

<div class="mx-auto max-w-7xl rounded-lg bg-white p-6 shadow-lg">
  <div class="mb-6 flex flex-col gap-4">
    <div class="flex items-center justify-between gap-4">
      <div class="flex flex-1 items-center gap-4">
        <SearchBar bind:searchTerm={filterStore.searchQuery} />
      </div>
      <FileFilters filters={filterStore.filters} files={fileStore.files} onTypeFilter={filterStore.setTypeFilter.bind(filterStore)} onSort={(config) => filterStore.setSortConfig(config)} />
    </div>
  </div>

  {#if filteredFiles.length === 0 && filterStore.filters.type !== "all"}
    <div class="flex flex-col items-center justify-center py-8 text-gray-500">
      <p class="text-lg font-medium">No {filterStore.filters.type} files found</p>
      <p class="mt-2">Try uploading some {filterStore.filters.type} files or switch to a different filter</p>
    </div>
  {:else}
    <FileTable
      files={fileStore.files}
      {paginatedFiles}
      sortConfig={filterStore.sortConfig}
      handleSort={(key) => {
        if (filterStore.sortConfig.key === key) {
          filterStore.setSortConfig({
            key,
            direction: filterStore.sortConfig.direction === "desc" ? "asc" : "desc"
          });
        } else {
          filterStore.setSortConfig({ key, direction: "desc" });
        }
      }}
    >
      {#snippet actions(file)}
        <ButtonActions item={file} type="file" />
      {/snippet}
    </FileTable>
  {/if}

  <FilePagination currentPage={filterStore.currentPage} {totalPages} itemsPerPage={filterStore.itemsPerPage} totalItems={filteredFiles.length} setPage={filterStore.setPage.bind(filterStore)} />
</div>
