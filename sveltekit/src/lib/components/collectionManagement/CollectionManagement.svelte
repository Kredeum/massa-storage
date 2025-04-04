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
  let kubo = createKuboClient();
  let kuboReady = $state(false);

  let ipfsApi = $state(localStorage.getItem("IPFS_API"));
  let ipfsApiOld = $state(localStorage.getItem("IPFS_API"));

  const refresh = async (): Promise<void> => {
    if (!ipfs.ready) return;

    isModerator = await ipfs.moderatorHas(ipfs.address);

    kuboReady = await kubo.ready();

    await loadCollections();
  };

  $effect(() => {
    refresh();
  });

  const isPinned = (cid: string): boolean => {
    return cidsPinned.includes(cid);
  };

  const isLocal = async (cid: string): Promise<boolean> => {
    try {
      const stat = await kubo.stat(`/ipfs/${cid}`, { timeout: TIMEOUT_VALUE, withLocal: true });
      return Boolean(stat.local);
    } catch (error) {
      return false;
    }
  };

  const loadCollections = async () => {
    if (!ipfs) return;

    cidsOnchain = await ipfs.cidsGet();
    if (kuboReady) {
      cidsPinned = await kubo.pins();
    }

    await Promise.all(
      Array.from(cidsOnchain.entries()).map(async ([collectionCid, attributes]) => {
        let filesCount = 0;
        let totalSize = 0;

        if (kuboReady) {
          try {
            attributes.isPinned = isPinned(collectionCid);
            attributes.isLocal = await isLocal(collectionCid);

            if (attributes.isLocal) {
              for await (const file of kubo.ls(collectionCid)) {
                filesCount++;
                totalSize += file.size;
              }
            }
          } catch (error) {
            console.error(`Error reading collection ${collectionCid}:`, error);
          }
        }

        const collectionItem: CollectionItem = {
          collectionCid,
          owner: attributes.owner,
          name: attributes.name,
          totalSizeBytes: totalSize || UNKNOWN_VALUE,
          filesCount: filesCount || UNKNOWN_VALUE,
          status: (attributes.status || STATUS_PENDING) as StatusType,
          timestamp: attributes.timestamp,
          isPinned: attributes.isPinned || false,
          isLocal: attributes.isLocal || false
        };

        allCollections.set(collectionCid, collectionItem);
      })
    );
    updateFilteredCollections();
  };

  const updateFilteredCollections = () => {
    filteredCollections = new SvelteMap(
      Array.from(allCollections)
        .sort(([_, a], [__, b]) => {
          const aValue = a[sortConfig.key];
          const bValue = b[sortConfig.key];
          const modifier = sortConfig.direction === "asc" ? 1 : -1;

          if (aValue === undefined || bValue === undefined) return 0;
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
    paginatedCollections = new SvelteMap(Array.from(filteredCollections).slice(startIndex, startIndex + ITEMS_PER_PAGE));
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

  const handleCollectionClick = async (collectionCid: string) => {
    if (!(await kubo.ready())) {
      const url = `https://dweb.link/ipfs/${collectionCid}`;
      window.open(url, "_blank");
      return;
    }
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

    const toastId = toast.loading(`Uploading ${fileCount} file${fileCount > 1 ? "s" : ""}...`);

    try {
      uploadInProgress = true;
      const newCids = await uploadStore.processUploadedCollections();
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
        const success = await ipfs.cidSet(collectionCid, attributesString);

        if (success) {
          toast.success("Collection created successfully");
          await loadCollections();
        } else {
          toast.error("Failed to create collection");
        }
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
      let success = false;
      if (data.status === STATUS_APPROVED) {
        success = await ipfs.cidValidate(data.id);
      } else if (data.status === STATUS_REJECTED) {
        success = await ipfs.cidReject(data.id);
      }

      if (success) {
        await loadCollections();
        toast.dismiss(toastId);
        toast.success(`Collection ${data.status === STATUS_APPROVED ? "approved" : "rejected"}`);
      } else {
        toast.dismiss(toastId);
        toast.error("Failed to moderate collection");
      }
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

  const handleIpfsApiChange = async () => {
    if (!ipfsApi) return;
    ipfsApi = ipfsApi.trim();

    let toastId = "";

    if (ipfsApiOld === ipfsApi) {
      toast.success("Refreshing IPFS datas...");
    } else {
      toastId = toast.loading("Updating IPFS API URL...");
      console.info("Updating ipfsApi:", ipfsApiOld, "=> ", ipfsApi);

      try {
        kubo = createKuboClient(ipfsApi);
        kuboReady = await kubo.ready();

        if (kuboReady) {
          ipfsApiOld = ipfsApi;
          localStorage.setItem("IPFS_API", ipfsApi);
          toast.success("IPFS API URL updated successfully");
        } else {
          toast.error("Could not connect to IPFS API");
          return;
        }
      } catch (error) {
        console.error("Failed to update IPFS API URL", error);
        toast.error("Failed to update IPFS API URL");
      } finally {
        toast.dismiss(toastId);
      }
    }

    await loadCollections();
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
    {#if ipfs.connected && kuboReady}
      <div class="mb-8">
        <FileUpload bind:files={uploadStore.fileList} />
      </div>
    {/if}

    <div class="mb-2 flex items-center justify-end gap-8">
      <div class="flex w-80 items-center justify-end">
        <CollectionFilters filters={collectionFilters} onStatusFilter={handleStatusFilter} />
      </div>
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

    <div class="mt-6 flex items-center justify-center gap-2">
      <input type="text" bind:value={ipfsApi} placeholder="Enter IPFS URL" class="w-80 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
      <button
        class="inline-flex items-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:border-blue-500 hover:text-blue-600 hover:shadow-sm focus:outline-none active:bg-gray-50"
        onclick={handleIpfsApiChange}
      >
        IPFS
      </button>
    </div>
  </div>
</div>
