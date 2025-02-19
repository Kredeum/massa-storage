<script lang="ts">
  import { getContext, onMount } from "svelte";
  import { createKuboClient } from "$lib/ts/kubo";
  import { STATUS_APPROVED, STATUS_REJECTED, STATUS_PENDING } from "@kredeum/massa-storage-common/src/constants";
  import type { DirectoryItem, StatusType } from "$lib/ts/types";
  import { goto } from "$app/navigation";

  import SearchBar from "../fileManagement/SearchBar.svelte";
  import FilePagination from "../fileManagement/FilePagination.svelte";

  let collections: DirectoryItem[] = [];
  let filteredCollections: DirectoryItem[] = [];
  let paginatedCollections: DirectoryItem[] = [];
  let selectedCollections: string[] = [];
  let currentPage = 1;
  let itemsPerPage = 10;
  let searchQuery = "";

  const sortConfig = {
    key: "creationDate",
    direction: "desc"
  };

  const ipfs = getContext("ipfs");
  const kubo = createKuboClient();

  onMount(async () => {
    await loadCollections();
  });

  async function loadCollections() {
    if (!ipfs) return;
    await ipfs.cidsGet();
    const collectionCids = ipfs.cids;
    console.log("collectionCids", collectionCids);

    const loadedCollections: DirectoryItem[] = [];

    collectionCids.forEach(async (value, collectionCid) => {
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

        const collectionItem: DirectoryItem = {
          owner: result.owner,
          collectionCid: collectionCid,
          name: result.name,
          totalSizeBytes: totalSize,
          filesCount: filesCount,
          status: result.status as StatusType,
          creationDate: result.date
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
    filteredCollections = collections.filter((collection) => collection.name.toLowerCase().includes(searchQuery.toLowerCase()));
    updatePagination();
  }

  function updatePagination() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    paginatedCollections = filteredCollections.slice(startIndex, endIndex);
  }

  function handleSort(key: keyof DirectoryItem) {
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
    goto(`/app/files/${collectionCid}`);
  }

  function handleSearch(event: CustomEvent<string>) {
    searchQuery = event.detail;
    updateFilteredCollections();
  }

  function setPage(page: number) {
    currentPage = page;
    updatePagination();
  }
</script>

<div class="mx-auto max-w-7xl rounded-lg bg-white p-6 shadow-lg">
  <div class="mb-6 flex flex-col gap-4">
    <div class="mb-8">
      <h1 class="text-2xl font-bold">Collection Management</h1>
      <p class="text-gray-600">Manage your IPFS collections</p>
    </div>

    <div class="flex items-center justify-between">
      <SearchBar onsearch={handleSearch} />
    </div>

    <!-- Collection Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500" onclick={() => handleSort("name")}> Name </th>
            <th class="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500" onclick={() => handleSort("totalSizeBytes")}> Size </th>
            <th class="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500" onclick={() => handleSort("filesCount")}> Files </th>
            <th class="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500" onclick={() => handleSort("owner")}> Owner </th>
            <th class="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500" onclick={() => handleSort("status")}> Status </th>
            <th class="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500" onclick={() => handleSort("creationDate")}> Created </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          {#each paginatedCollections as collection}
            <tr class="cursor-pointer hover:bg-gray-50" onclick={() => handleCollectionClick(collection.collectionCid)}>
              <td class="whitespace-nowrap px-6 py-4">
                <div class="text-sm font-medium text-gray-900">{collection.name}</div>
                <div class="text-sm text-gray-500">{collection.collectionCid}</div>
              </td>
              <td class="whitespace-nowrap px-6 py-4">
                <div class="text-sm text-gray-900">{(collection.totalSizeBytes / 1024).toFixed(2)} KB</div>
              </td>
              <td class="whitespace-nowrap px-6 py-4">
                <div class="text-sm text-gray-900">{collection.filesCount}</div>
              </td>
              <td class="whitespace-nowrap px-6 py-4">
                <div class="text-sm text-gray-900">{collection.owner}</div>
              </td>
              <td class="whitespace-nowrap px-6 py-4">
                <span
                  class="inline-flex rounded-full px-2 text-xs font-semibold leading-5
                    {collection.status === STATUS_APPROVED ? 'bg-green-100 text-green-800' : collection.status === STATUS_REJECTED ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}"
                >
                  {collection.status}
                </span>
              </td>
              <td class="whitespace-nowrap px-6 py-4">
                <div class="text-sm text-gray-900">{new Date(collection.creationDate).toLocaleDateString()}</div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="mt-4">
      <FilePagination {currentPage} totalPages={Math.ceil(filteredCollections.length / itemsPerPage)} {itemsPerPage} totalItems={filteredCollections.length} {setPage} />
    </div>
  </div>
</div>
