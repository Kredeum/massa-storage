<script lang="ts">
  import { getContext } from "svelte";
  import { createKuboClient } from "$lib/ts/kubo";
  import type { AddResult } from "kubo-rpc-client";
  import { STATUS_APPROVED, STATUS_REJECTED, STATUS_PENDING } from "@kredeum/massa-storage-common/src/constants";
  import type { CollectionItem, StatusType, CollectionSortConfig, CidDataType, CidDataTypePlus, CollectionFilterState } from "$lib/ts/types";
  import { goto } from "$app/navigation";
  import { toast } from "svelte-hot-french-toast";

  import FilePagination from "../fileManagement/FilePagination.svelte";
  import FileUpload from "../fileManagement/FileUpload.svelte";
  import CollectionFilters from "../collectionTable/CollectionFilters.svelte";

  import { UploadStore } from "$lib/runes/UploadStore.svelte";

  import { timestamp } from "$lib/ts/utils";
  import CollectionTable from "../collectionTable/CollectionTable.svelte";

  import type { Ipfs } from "$lib/runes/ipfs.svelte";
  import { SvelteMap } from "svelte/reactivity";

  const TIMEOUT_VALUE = 1000;
  const ITEMS_PER_PAGE = 10;
  const UNKNOWN_VALUE = -1;

  let isModerator = $state<boolean>();
  let uploadStore = new UploadStore();
  let uploadInProgress = false;

  let cidsOnchain = $state<SvelteMap<string, CidDataTypePlus>>(new SvelteMap());
  let cidsPinned = $state<Array<string>>([]);

  let allCollections: SvelteMap<string, CollectionItem> = $state(new SvelteMap());
  let filteredCollections: SvelteMap<string, CollectionItem> = $state(new SvelteMap());
  let paginatedCollections: SvelteMap<string, CollectionItem> = $state(new SvelteMap());
  let currentPage = $state(1);

  let collectionFilters = $state<CollectionFilterState>({
    status: "all"
  });

  let sortConfig: CollectionSortConfig = $state({
    key: "timestamp",
    direction: "desc"
  });

  const ipfs: Ipfs = getContext("ipfs");
  const kubo = createKuboClient();

  const refresh = async (): Promise<void> => {
    if (!ipfs.ready) return;

    isModerator = await ipfs.moderatorHas(ipfs.address);

    await loadCollections();
  };

  $effect(() => {
    refresh();
  });

  const isPinned = (cid: string): boolean => {
    return cidsPinned.includes(cid);
  };

  const isLocal = async (cid: string): Promise<boolean> => {
    // console.log("isLocal ~ cid:", cid);
    try {
      const stat = await kubo.stat(`/ipfs/${cid}`, { timeout: TIMEOUT_VALUE, withLocal: true });
      // console.log("isLocal ~ size, local:", stat.local, stat.cumulativeSize);
      return Boolean(stat.local);
    } catch (error) {
      return false;
    }
  };

  const loadCollections = async () => {
    if (!ipfs) return;

    cidsOnchain = await ipfs.cidsGet();
    cidsPinned = await kubo.pins();

    console.log("loadCollections ~ cidsOnchain.size:", cidsOnchain.size);
    console.log("loadCollections ~ cidsPinned:", cidsPinned.length);

    await Promise.all(
      Array.from(cidsOnchain.entries()).map(async ([collectionCid, attributes]) => {
        if (!collectionCid) return;

        try {
          attributes.isPinned = isPinned(collectionCid);
          attributes.isLocal = await isLocal(collectionCid);

          let filesCount = 0;
          let totalSize = 0;

          if (attributes.isLocal) {
            for await (const file of kubo.ls(collectionCid)) {
              filesCount++;
              totalSize += file.size;
            }
          } else {
            filesCount = UNKNOWN_VALUE;
            totalSize = UNKNOWN_VALUE;
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
            console.error(`Error determining attributes for CID ${collectionCid}:`, error);
            return;
          }

          const collectionItem: CollectionItem = {
            collectionCid,
            owner: attributes.owner,
            name: attributes.name,
            totalSizeBytes: totalSize,
            filesCount: filesCount,
            status: currentStatus,
            timestamp: attributes.timestamp,
            isPinned: attributes.isPinned,
            isLocal: attributes.isLocal
          };

          // console.log("cidsOnchain.forEach ~ collectionCid:", collectionCid);
          allCollections.set(collectionCid, collectionItem);
        } catch (error) {
          console.error(`Error loading collection ${collectionCid}:`, error);
        }
      })
    );
    console.log("loadCollections2 final ~ allCollections.size:", allCollections.size);
    updateFilteredCollections();
  };

  const updateFilteredCollections = () => {
    filteredCollections = new SvelteMap(
      Array.from(allCollections)
        .sort(([_, a], [__, b]) => {
          const aValue = a[sortConfig.key];
          const bValue = b[sortConfig.key];
          const modifier = sortConfig.direction === "asc" ? 1 : -1;

          if (aValue < bValue) return -1 * modifier;
          if (aValue > bValue) return 1 * modifier;
          return 0;
        })
        .filter(([_, collection]) => {
          if (!(isModerator || collection.status === STATUS_APPROVED)) {
            return false;
          }
          return collectionFilters.status === "all" || collection.status === collectionFilters.status;
        })
    );
    updatePagination();
  };

  const updatePagination = () => {
    if (filteredCollections.size === 0) {
      paginatedCollections = new SvelteMap();
      return;
    }
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE - 1;
    paginatedCollections = new SvelteMap(Array.from(filteredCollections).slice(startIndex, endIndex));
  };

  const handleSort = (key: keyof CollectionItem) => {
    if (sortConfig.key === key) {
      sortConfig.direction = sortConfig.direction === "asc" ? "desc" : "asc";
    } else {
      sortConfig.key = key;
      sortConfig.direction = "asc";
    }
    updateFilteredCollections();
  };

  const handleCollectionClick = (collectionCid: string) => {
    goto(`/app/collection/${collectionCid}`);
  };

  const handleStatusFilter = (status: StatusType | "all") => {
    collectionFilters.status = status;
    updateFilteredCollections();
  };

  const uploadCollection = async () => {
    const fileCount = uploadStore.fileList?.length || 0;

    if (fileCount === 0) return;
    if (!ipfs || uploadInProgress) return;

    const toastId = toast.loading(`Uploading ${fileCount} files...`);

    try {
      uploadInProgress = true;
      const newCids = await uploadStore.processUploadedCollections();
      toast.success(`Successfully uploaded ${fileCount} files`);
      const validCids = newCids.filter((item): item is AddResult => {
        return typeof item !== "string";
      });

      if (validCids.length > 0) {
        const lastCid = validCids[validCids.length - 1];
        const collectionCid = lastCid.cid.toString();

        const attributes: CidDataType = {
          name: `Collection ${timestamp()}`,
          timestamp: Date.now(),
          owner: ipfs.address || "",
          status: STATUS_PENDING
        };

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
      toast.dismiss(toastId);
    }
  };

  const handleModerate = async (data: { id: string; status: StatusType }) => {
    const toastId = toast.loading(`Moderating collection ...`);
    try {
      if (data.status === STATUS_APPROVED) {
        await ipfs.cidValidate(data.id);
      } else if (data.status === STATUS_REJECTED) {
        await ipfs.cidReject(data.id);
      }
      await loadCollections();
      toast.dismiss(toastId);
      toast.success(`Collection ${data.status === STATUS_APPROVED ? "approved" : "rejected"}`);
    } catch (error) {
      toast.dismiss(toastId);
      console.error("Error moderating collection:", error);
      toast.error("Failed to moderate collection");
    }
  };

  const handlePin = async (cid: string) => {
    try {
      const collection = allCollections.get(cid);
      if (!collection) {
        toast.error("Collection not found");
        return;
      }

      if (collection.status !== STATUS_APPROVED) {
        toast.error("Cannot pin: collection not approved");
        return;
      }

      if (collection.isPinned) {
        toast.error("Cannot pin: collection is already pinned");
        return;
      }

      const id = toast.loading("Pinning Collection ...");
      await kubo.pin(cid);

      cidsPinned = await kubo.pins();
      if (isPinned(cid)) {
        collection.isPinned = true;
        allCollections.set(cid, collection);
        await loadCollections();
      }

      updateFilteredCollections();

      toast.dismiss(id);
      toast.success("Collection pinned successfully");
    } catch (error) {
      console.error("Error pinning collection:", error);
      toast.error("Failed to pin collection");
    }
  };

  $effect(() => {
    uploadCollection();
  });

  const setPage = (page: number) => {
    currentPage = page;
    updatePagination();
  };
</script>

<div class="mx-auto max-w-7xl rounded-lg bg-white p-6 shadow-lg">
  <div class="mb-6 flex flex-col gap-4">
    <div class="mb-8">
      <FileUpload bind:files={uploadStore.fileList} />
    </div>

    <div class="flex items-center justify-end gap-4">
      <CollectionFilters filters={collectionFilters} onStatusFilter={handleStatusFilter} />
    </div>

    <!-- Collection Table -->
    {#if filteredCollections.size === 0 && collectionFilters.status !== "all"}
      <div class="flex flex-col items-center justify-center py-8 text-gray-500">
        <p class="text-lg font-medium">No collections found</p>
      </div>
    {:else}
      <CollectionTable
        collections={[...paginatedCollections.values()]}
        {sortConfig}
        {handleSort}
        handleClick={handleCollectionClick}
        onModerate={isModerator ? handleModerate : undefined}
        onPin={handlePin}
      />
    {/if}

    <div class="mt-4">
      <FilePagination {currentPage} totalPages={Math.ceil(filteredCollections.size / ITEMS_PER_PAGE)} itemsPerPage={ITEMS_PER_PAGE} totalItems={filteredCollections.size} {setPage} />
    </div>
  </div>
</div>
