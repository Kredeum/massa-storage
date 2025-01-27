<script lang="ts">
  import { getContext, onMount } from "svelte";
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
  import type { FileItem, FileStatus } from "$lib/ts/types";
  import { Ipfs } from "$lib/runes/ipfs.svelte";

  // TEST
  import { formatDate } from "$lib/ts/utils";
  import { createKuboClient } from "$lib/ts/kubo";
  import all from "it-all";
  import { CID } from "multiformats";

  let kubo: ReturnType<typeof createKuboClient>;
  let cids = $state<any>(null);
  let files = $state<FileList>();
  // TEST ENDS

  const fileStore = new FileStore();
  const filterStore = new FilterStore();
  const uploadStore = new UploadStore();
  const ipfs: Ipfs = getContext("ipfs");

  $effect(() => {
    if (uploadStore.uploadFiles) {
      (async () => {
        const newFiles = await uploadStore.processUploadedFiles();
        fileStore.addFiles(newFiles);
      })();
    }
  });

  // const getCids = async () => {
  //   try {
  //     let filesArray = [];
  //     for await (const file of files) {
  //       filesArray.push({
  //         path: file.name,
  //         content: new Uint8Array(await file.arrayBuffer())
  //       });
  //     }

  //     cids = await all(kubo.addAll(filesArray, { wrapWithDirectory: true }));
  //     console.log("filesHandle ~ cids:", cids);
  //     cids.forEach((cid: string) => {
  //       const file: FileItem = {
  //         cid: cid,
  //         name: cid,
  //         id: Date.now() + Math.random(),
  //         size: "unknown",
  //         sizeInBytes: -1,
  //         status: "Pending",
  //         isPinned: true,
  //         uploadDate: formatDate(),
  //         blob: undefined,
  //         mimeType: undefined,
  //         arrayBuffer: undefined
  //       };
  //       fileStore.files.push(file);
  //     });
  //   } catch (error) {
  //     console.error("Error uploading file:", error);
  //   }
  // };

  // $effect(() => {
  //   getCids();
  // });

  // onMount(async () => {
  //   kubo = await createKuboClient();
  // });

  const getCids = async () => {
    await ipfs?.cidsGet();
    const cids = ipfs.cids;
    cids.forEach((cid) => {
      console.log("cid:", cid);
      const file: FileItem = {
        cid: cid,
        name: cid,
        id: Date.now() + Math.random(),
        size: undefined,
        sizeInBytes: -1,
        status: "Pending",
        isPinned: true,
        uploadDate: formatDate(),
        blob: undefined,
        mimeType: undefined,
        arrayBuffer: undefined
      };
      fileStore.files.push(file);
    });
  };

  onMount(() => {
    getCids();
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
