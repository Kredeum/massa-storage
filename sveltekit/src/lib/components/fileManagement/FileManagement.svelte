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

  // TEST---------------------------------------------------
  import { formatDate } from "$lib/ts/utils";
  import { createKuboClient } from "$lib/ts/kubo";
  import all from "it-all";
  import { CID } from "multiformats";
  import FilePreview from "../fileTable/FilePreview.svelte";
  import toast from "svelte-hot-french-toast";

  let kubo: ReturnType<typeof createKuboClient>;
  let cids = $state<any | undefined>();
  let files = $state<FileList>();
  // TEST ENDS------------------------------------------------

  const fileStore = new FileStore();
  const filterStore = new FilterStore();
  const uploadStore = new UploadStore();
  const ipfs: Ipfs = getContext("ipfs");

  $effect(() => {
    if (uploadStore.uploadFiles) {
      (async () => {
        cids = await uploadStore.processUploadedFiles();
        const dirCid = getDirCid();
        try {
          await ipfs?.cidAdd(dirCid);
        } catch (error) {
          console.error("Failed to add directory:", error);
        }
      })();
    }
  });

  // -------------------------------------------------------------------------

  interface FileInfo {
    path: string;
    cid: string; // ou CID selon ton usage
    size: number;
  }

  // To display files information
  const getDirCid = () => {
    const cidsArray = Array.from(cids) as FileInfo[]; // Convert Proxy to Array
    console.log("cidsArray", cidsArray[0]);
    const files = cidsArray.map(({ path, cid, size }) => {
      return { path, cid, size };
    });
    console.log("files", files);
    const dirCid = files[files.length - 1].cid.toString();
    console.log("dirCid", dirCid);
    return dirCid;
  };

  // -------------------------------------------------------------------------

  onMount(async () => {
    kubo = await createKuboClient();
    await getFiles();
  });

  const getFiles = async () => {
    await ipfs?.cidsGet();
    const cids = ipfs.cids;
    cids.forEach(async (cid) => {
      console.log("fileRetreive:", cid);
      if (!cid) return "";
      // ---TEST WITH CAT------------------------------------
      let retreivedFile = $state<string>("");
      try {
        const chunks = await all(kubo.cat(CID.parse(cid)));
        const blob = new Blob(chunks);
        const reader = new FileReader();

        reader.onloadend = () => {
          retreivedFile = reader.result as string;
        };

        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Error retrieving file:", error);
      }
      // ---TEST WITH IPFS GET--------------------------------------
      // let retreivedFile = $state<string>("");
      try {
        retreivedFile = await ipfs.get(cid);
      } catch (error) {
        console.error("Error retrieving file:", error);
      }

      const file: FileItem = {
        cid: cid,
        name: "N/A",
        sizeInBytes: -1,
        status: "Pending",
        isPinned: false,
        uploadDate: formatDate(),
        mimeType: undefined,
        arrayBuffer: undefined
      };
      fileStore.files.push(file);
    });
  };

  //-------TEST---------------------------------------------------

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
        <TagInput selectedFiles={fileStore.selectedFiles} files={fileStore.files} onAddTag={fileStore.addTag.bind(fileStore)} onRemoveTag={fileStore.removeTag.bind(fileStore)} />
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
