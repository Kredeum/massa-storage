<script lang="ts">
  import { getContext, onMount } from "svelte";
  import { createKuboClient } from "$lib/ts/kubo";
  import type { AddResult } from "kubo-rpc-client";
  import { STATUS_APPROVED, STATUS_REJECTED, STATUS_PENDING } from "@kredeum/massa-storage-common/src/constants";
  import type { CollectionItem, StatusType, CidDataType, CollectionFilterState } from "$lib/ts/types";
  import { goto } from "$app/navigation";
  import { toast } from "svelte-hot-french-toast";

  import FilePagination from "../fileManagement/FilePagination.svelte";
  import FileUpload from "../fileManagement/FileUpload.svelte";
  import CollectionFilters from "../collectionTable/CollectionFilters.svelte";

  import { UploadStore } from "$lib/runes/UploadStore.svelte";

  import { formatDate, timestamp } from "$lib/ts/utils";
  import CollectionTable from "../collectionTable/CollectionTable.svelte";

  import type { Ipfs } from "$lib/runes/ipfs.svelte";

  let uploadStore = new UploadStore();
  let uploadInProgress = false;

  let collections: CollectionItem[] = [];
  let filteredCollections: CollectionItem[] = $state([]);
  let paginatedCollections: CollectionItem[] = $state([]);
  let currentPage = $state(1);
  let itemsPerPage = $state(10);

  let collectionFilters = $state<CollectionFilterState>({
    status: "all"
  });

  type SortConfig = {
    key: keyof CollectionItem;
    direction: "asc" | "desc";
  };

  let sortConfig: SortConfig = $state({
    key: "uploadDate" as keyof CollectionItem,
    direction: "desc" as const
  });

  const ipfs: Ipfs = getContext("ipfs");
  const kubo = createKuboClient();

  onMount(async () => {
    await loadCollections();
  });

  async function loadCollections() {
    if (!ipfs) return;
    await ipfs.cidsGet();
    const collectionCids = ipfs.cids;
    console.log("collectionCids", collectionCids);

    const loadedCollections: CollectionItem[] = [];

    collectionCids.forEach(async (attributes, collectionCid) => {
      if (!collectionCid) return;

      try {
        const result = await ipfs.cidGet(collectionCid);
        if (result === undefined) return;

        const collectionStats = await kubo.ls(collectionCid);
        let filesCount = 0;
        let totalSize = 0;

        for await (const file of collectionStats) {
          filesCount++;
          totalSize += file.size;
        }

        // Determine the current status
        let currentStatus: StatusType = STATUS_PENDING;
        try {
          if (!attributes || !attributes.status) return;
          switch (attributes.status) {
            case STATUS_APPROVED:
              currentStatus = STATUS_APPROVED;
              break;
            case STATUS_REJECTED:
              currentStatus = STATUS_REJECTED;
              break;
            case STATUS_PENDING:
              currentStatus = STATUS_PENDING;
              break;
            default:
              console.error(`Unknown status value: ${attributes.status}`);
          }
        } catch (error) {
          console.error(`Error determining status for CID ${collectionCid}:`, error);
          return;
        }

        const collectionItem: CollectionItem = {
          owner: attributes.owner,
          collectionCid: collectionCid,
          name: attributes.name,
          totalSizeBytes: totalSize,
          filesCount: filesCount,
          status: currentStatus,
          uploadDate: attributes.date,
          isPinned: false
        };

        loadedCollections.push(collectionItem);
        collections = [...loadedCollections];
        updateFilteredCollections();
      } catch (error) {
        console.error(`Error loading collection ${collectionCid}:`, error);
      }
    });
  }

  function updateFilteredCollections() {
    filteredCollections = collections.filter((collection) => {
      return collectionFilters.status === "all" || collection.status === collectionFilters.status;
    });
    updatePagination();
  }

  function updatePagination() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    paginatedCollections = filteredCollections.slice(startIndex, endIndex);
  }

  function handleSort(key: keyof CollectionItem) {
    if (sortConfig.key === key) {
      sortConfig.direction = sortConfig.direction === "asc" ? "desc" : "asc";
    } else {
      sortConfig.key = key;
      sortConfig.direction = "asc";
    }

    collections.sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];
      const modifier = sortConfig.direction === "asc" ? 1 : -1;

      if (aValue < bValue) return -1 * modifier;
      if (aValue > bValue) return 1 * modifier;
      return 0;
    });

    updateFilteredCollections();
  }

  function handleCollectionClick(collectionCid: string) {
    goto(`/app/collection/${collectionCid}`);
  }

  function handleStatusFilter(status: StatusType | "all") {
    collectionFilters.status = status;
    updateFilteredCollections();
  }

  async function uploadCollection() {
    if (!ipfs || uploadInProgress) return;

    try {
      uploadInProgress = true;
      const newCids = await uploadStore.processUploadedCollections();
      const validCids = newCids.filter((item): item is AddResult => {
        return typeof item !== "string";
      });
      console.log("Processed files, got collection CIDs:", validCids.length);

      if (validCids.length > 0) {
        const lastCid = validCids[validCids.length - 1];
        const collectionCid = lastCid.cid.toString();
        console.log("Processing collection:", { collectionCid });

        const attributes: CidDataType = {
          name: `Collection ${timestamp()}`,
          date: formatDate(),
          owner: ipfs.address,
          status: STATUS_PENDING
        };

        console.log("Setting attributes:", attributes);
        const attributesString = JSON.stringify(attributes);
        await ipfs.cidSet(collectionCid, attributesString);
        toast.success("Collection created successfully");
        await loadCollections();
      }
    } catch (error) {
      console.error("Failed to add collection:", error);
      toast.error("Failed to create collection");
    } finally {
      uploadInProgress = false;
    }
  }

  async function handleModerate(data: { id: string; status: StatusType }) {
    try {
      if (data.status === STATUS_APPROVED) {
        await ipfs.cidValidate(data.id);
      } else if (data.status === STATUS_REJECTED) {
        await ipfs.cidReject(data.id);
      }
      await loadCollections();
      toast.success(`Collection ${data.status === STATUS_APPROVED ? "approved" : "rejected"}`);
    } catch (error) {
      console.error("Error moderating collection:", error);
      toast.error("Failed to moderate collection");
    }
  }

  // TODO: Implement pin functionality for collections

  async function handlePin(id: string) {
    // try {
    // console.log("Pin collection:", id);
    // toast.success("Collection pinned successfully");
    // } catch (error) {
    // console.error("Error pinning collection:", error);
    // toast.error("Failed to pin collection");
    // }
  }

  $effect(() => {
    if (uploadStore.uploadCollection) {
      uploadCollection();
    }
  });

  function setPage(page: number) {
    currentPage = page;
    updatePagination();
  }
</script>

<div class="mx-auto max-w-7xl rounded-lg bg-white p-6 shadow-lg">
  <div class="mb-6 flex flex-col gap-4">
    <div class="mb-8">
      <FileUpload bind:files={uploadStore.uploadCollection} />
    </div>

    <div class="flex items-center justify-end gap-4">
      <CollectionFilters filters={collectionFilters} onStatusFilter={handleStatusFilter} />
    </div>

    <!-- Collection Table -->
    {#if filteredCollections.length === 0 && collectionFilters.status !== "all"}
      <div class="flex flex-col items-center justify-center py-8 text-gray-500">
        <p class="text-lg font-medium">No {collectionFilters.status.toLowerCase()} collections found</p>
        <p class="mt-2">There are no collections with {collectionFilters.status.toLowerCase()} status</p>
      </div>
    {:else}
      <CollectionTable collections={paginatedCollections} {sortConfig} {handleSort} handleClick={handleCollectionClick} onModerate={handleModerate} onPin={handlePin} />
    {/if}

    <div class="mt-4">
      <FilePagination {currentPage} totalPages={Math.ceil(filteredCollections.length / itemsPerPage)} {itemsPerPage} totalItems={filteredCollections.length} {setPage} />
    </div>
  </div>
</div>
