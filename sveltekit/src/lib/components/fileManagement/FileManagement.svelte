<script lang="ts">
  import SearchBar from "./SearchBar.svelte";
  import FileFilters from "./FileFilters.svelte";
  import FileTable from "../fileTable/FileTable.svelte";
  import FileActions from "./FileActions.svelte";
  import FileUpload from "./FileUpload.svelte";
  import FileSelectionBar from "./FileSelectionBar.svelte";
  import FilePagination from "./FilePagination.svelte";
  import TagInput from "./TagInput.svelte";

  import { FileStore } from "$lib/runes/FileStore.svelte";
  import { FilterStore } from "$lib/runes/FilterStore.svelte";
  import { UploadStore } from "$lib/runes/UploadStore.svelte";
  import type { FileStatus } from "$lib/ts/types";

  const fileStore = new FileStore();
  const filterStore = new FilterStore();
  const uploadStore = new UploadStore();

  $effect(() => {
    if (uploadStore.uploadFiles) {
      (async () => {
        const newFiles = await uploadStore.processUploadedFiles();
        fileStore.addFiles(newFiles);
      })();
    }
  });

  const filteredFiles = $derived(filterStore.filterFiles(fileStore.files));
  const paginatedFiles = $derived(filterStore.getPaginatedFiles(fileStore.files));
  const totalPages = $derived(filterStore.getTotalPages(fileStore.files));
</script>

<div class="mx-auto max-w-7xl rounded-lg bg-white p-6 shadow-lg">
  <div class="mb-6 flex flex-col gap-4">
    <div class="mb-8">
      <FileUpload bind:files={uploadStore.uploadFiles} />
    </div>
    <div class="flex items-center justify-between gap-4">
      <div class="flex flex-1 items-center gap-4">
        <SearchBar bind:searchTerm={filterStore.searchQuery} />
        <TagInput selectedFiles={fileStore.selectedFiles} files={fileStore.files} onAddTag={fileStore.addTag.bind(fileStore)} />
        {#if fileStore.selectedFiles.length > 0}
          <FileSelectionBar
            selectedCount={fileStore.selectedFiles.length}
            onApprove={fileStore.bulkApprove.bind(fileStore)}
            onReject={fileStore.bulkReject.bind(fileStore)}
            onPin={fileStore.bulkPin.bind(fileStore)}
          />
        {/if}
      </div>
      <FileFilters filters={filterStore.filters} files={fileStore.files} onTypeFilter={filterStore.setTypeFilter.bind(filterStore)} onSort={(config) => filterStore.setSortConfig(config)} />
    </div>
  </div>

  <FileTable
    files={fileStore.files}
    {paginatedFiles}
    selectedFiles={fileStore.selectedFiles}
    sortConfig={filterStore.sortConfig}
    handleSort={(key) => {
      if (filterStore.sortConfig.key === key) {
        filterStore.setSortConfig({
          key,
          direction: filterStore.sortConfig.direction === "asc" ? "desc" : "asc"
        });
      } else {
        filterStore.setSortConfig({ key, direction: "desc" });
      }
    }}
    onSelectionChange={fileStore.setSelectedFiles.bind(fileStore)}
    onFilterChange={(status: FileStatus | "all") => filterStore.setStatusFilter(status)}
    {filteredFiles}
  >
    {#snippet actions(file)}
      <FileActions {file} onModerate={(data) => fileStore.updateFileStatus(data.id, data.status)} onPin={(id) => fileStore.togglePin(id)} />
    {/snippet}
  </FileTable>

  <FilePagination currentPage={filterStore.currentPage} {totalPages} itemsPerPage={filterStore.itemsPerPage} totalItems={filteredFiles.length} setPage={filterStore.setPage.bind(filterStore)} />
</div>
