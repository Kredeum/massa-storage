<script lang="ts">
  import { getContext, onMount } from "svelte";
  import { createKuboClient } from "$lib/ts/kubo";
  import type { AddResult } from "kubo-rpc-client";
  import { STATUS_APPROVED, STATUS_REJECTED, STATUS_PENDING } from "@kredeum/massa-storage-common/src/constants";
  import type { CidDataType } from "$lib/ts/types";

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
  import type { FileItem, StatusType } from "$lib/ts/types";
  import { formatDate } from "$lib/ts/utils";

  import { Ipfs } from "$lib/runes/ipfs.svelte";

  let kubo: ReturnType<typeof createKuboClient>;
  let cids = $state<AddResult[]>([]);

  const fileStore = new FileStore();
  const filterStore = new FilterStore();
  const uploadStore = new UploadStore();
  const ipfs: Ipfs = getContext("ipfs");

  const getDirCid = () => {
    const cidsArray = Array.from(cids); // Convert Proxy to Array
    console.log("cidsArray", cidsArray[0]);
    const files = cidsArray.map(({ path, cid, size }) => {
      return { path, cid, size };
    });
    console.log("files", files);
    const dirCid = files[files.length - 1].cid.toString();
    console.log("dirCid", dirCid);
    return dirCid;
  };

  const uploadFiles = async () => {
    if (!ipfs) return;
    if (!uploadStore.uploadFiles) return;
    cids = (await uploadStore.processUploadedFiles()).filter((item): item is AddResult => {
      return typeof item !== "string";
    });
    const dirCid = getDirCid();
    try {
      const attributes: CidDataType = {
        name: "dirName",
        date: formatDate(),
        owner: ipfs.address,
        status: STATUS_PENDING
      };
      const attributesString = JSON.stringify(attributes);
      await ipfs.cidSet(dirCid, attributesString);
    } catch (error) {
      console.error("Failed to add directory:", error);
    }
  };

  $effect(() => {
    uploadFiles();
  });

  const handleApprove = (fileStore: FileStore) => {
    fileStore.bulkApprove.bind(fileStore);
    fileStore.files.map((file) => ipfs.cidValidate(file.cid));
  };

  const handleReject = (fileStore: FileStore) => {
    fileStore.bulkReject.bind(fileStore);
    fileStore.files.map((file) => ipfs.cidReject(file.cid));
  };

  onMount(async () => {
    kubo = await createKuboClient();
    await getFiles();
  });

  const getFiles = async () => {
    if (!ipfs) return;
    await ipfs.cidsGet();
    const cids = ipfs.cids;
    console.log("cids", cids);

    // NOTE: DONT USE VALUE FOR NOW!!!!
    cids.forEach(async (value, cid) => {
      if (!cid) return;
      let attributes;
      let currentStatus: StatusType = STATUS_PENDING;
      let fileName = "";
      let fileCid = "";
      let fileSizeInBytes = 0;

      // Get the file data
      try {
        const result = await ipfs.cidGet(cid);
        if (result === undefined) return;
        attributes = result;
        console.log("attributes", attributes);
      } catch (error) {
        console.error(`Error fetching file data for CID ${cid}:`, error);
        return;
      }

      // Determine the current status
      try {
        if (!attributes || !attributes.status) return;
        if (attributes.status === "1") {
          currentStatus = STATUS_APPROVED;
        } else if (attributes.status === "0") {
          currentStatus = STATUS_REJECTED;
        }
      } catch (error) {
        console.error(`Error determining status for CID ${cid}:`, error);
        return;
      }

      // Get file details from Kubo
      try {
        const files = await kubo.ls(cid);
        for await (const file of files) {
          console.log("file", file);
          fileName = file.name;
          fileCid = cid.toString();
          fileSizeInBytes = file.size;
        }
      } catch (error) {
        console.error(`Error getting file details from Kubo for CID ${cid}:`, error);
        return;
      }

      // Create and store the file item
      try {
        if (!attributes) return;
        const file: FileItem = {
          owner: attributes.owner,
          cid: fileCid,
          name: fileName,
          uploadDate: attributes.date,
          sizeInBytes: fileSizeInBytes,
          status: currentStatus,
          isPinned: false,
          mimeType: undefined,
          arrayBuffer: undefined,
          tags: attributes.name ? [attributes.name] : []
        };
        fileStore.files.push(file);
      } catch (error) {
        console.error(`Error creating file item for CID ${cid}:`, error);
      }
    });
  };

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
            onApprove={() => handleApprove(fileStore)}
            onReject={() => handleReject(fileStore)}
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
    onFilterChange={(status: StatusType | "all") => filterStore.setStatusFilter(status)}
    {filteredFiles}
  >
    {#snippet actions(file)}
      <FileActions {file} onModerate={(data) => fileStore.updateStatusType(data.id, data.status)} onPin={(id) => fileStore.togglePin(id)} />
    {/snippet}
  </FileTable>

  <FilePagination currentPage={filterStore.currentPage} {totalPages} itemsPerPage={filterStore.itemsPerPage} totalItems={filteredFiles.length} setPage={filterStore.setPage.bind(filterStore)} />
</div>
