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
  import { formatDate, getFileTypeFromName } from "$lib/ts/utils";

  import { Ipfs } from "$lib/runes/ipfs.svelte";

  const { dirCid = null } = $props<{ dirCid?: string | null }>();

  let kubo: ReturnType<typeof createKuboClient>;
  let cids = $state<AddResult[]>([]);
  let uploadInProgress = $state(false);

  const fileStore = new FileStore();
  const filterStore = new FilterStore();
  const uploadStore = new UploadStore();
  const ipfs: Ipfs = getContext("ipfs");

  const getDirCid = () => {
    const cidsArray = Array.from(cids); // Convert Proxy to Array
    const files = cidsArray.map(({ path, cid, size }) => {
      return { path, cid, size };
    });
    const dirCid = files[files.length - 1].cid.toString();
    console.log("dirCid", dirCid);
    return dirCid;
  };

  const uploadFiles = async () => {
    console.log("uploadFiles called");
    if (!ipfs || !uploadStore.uploadFiles || uploadInProgress) return;

    try {
      uploadInProgress = true;
      const newCids = await uploadStore.processUploadedFiles();
      const validCids = newCids.filter((item): item is AddResult => {
        return typeof item !== "string";
      });
      console.log("Processed files, got CIDs:", validCids.length);

      if (validCids.length > 0) {
        cids = validCids;
        const dirCid = getDirCid();
        console.log("Processing directory:", { dirCid });

        const attributes: CidDataType = {
          name: "dirName",
          date: formatDate(),
          owner: ipfs.address,
          status: STATUS_PENDING
        };

        console.log("Setting attributes:", attributes);
        const attributesString = JSON.stringify(attributes);
        await ipfs.cidSet(dirCid, attributesString);
      }
    } catch (error) {
      console.error("Failed to add directory:", error);
    } finally {
      uploadInProgress = false;
    }
  };

  $effect(() => {
    if (uploadStore.uploadFiles) {
      uploadFiles();
    }
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

    const dirCids = ipfs.cids;
    console.log("dirCids", dirCids);

    // NOTE: WEDONT USE VALUE FOR NOW!!!!
    dirCids.forEach(async (attributes: CidDataType, dirCid) => {
      if (!dirCid) return;

      let currentStatus: StatusType = STATUS_PENDING;
      let fileName = "";
      let fileCid = "";
      let fileSizeInBytes = 0;

      // Determine the current status
      try {
        if (!attributes || !attributes.status) return;
        if (attributes.status === "1") {
          currentStatus = STATUS_APPROVED;
        } else if (attributes.status === "0") {
          currentStatus = STATUS_REJECTED;
        }
      } catch (error) {
        console.error(`Error determining status for CID ${dirCid}:`, error);
        return;
      }

      // Get other file details from Kubo
      try {
        const files = await kubo.ls(dirCid);
        for await (const file of files) {
          console.log("file", file);
          console.log("Kubo file details:", JSON.stringify(file, null, 2));
          fileName = file.name;
          fileCid = file.cid.toString();
          fileSizeInBytes = file.size;
        }
      } catch (error) {
        console.error(`Error getting file details from Kubo for CID ${dirCid}:`, error);
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
          tags: fileName ? [fileName] : [],
          type: getFileTypeFromName(fileName)
        };
        const dir: FileItem = {
          owner: attributes.owner,
          cid: dirCid,
          name: attributes.name,
          uploadDate: attributes.date,
          sizeInBytes: fileSizeInBytes,
          status: currentStatus,
          isPinned: false,
          mimeType: undefined,
          arrayBuffer: undefined,
          tags: attributes.name ? [attributes.name] : [],
          type: getFileTypeFromName(fileName)
        };
        fileStore.files.push(file);
      } catch (error) {
        console.error(`Error creating file item for CID ${dirCid}:`, error);
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
