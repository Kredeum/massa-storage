<script lang="ts">
  import type { CollectionItem, SortConfig, StatusType } from "$lib/ts/types";
  import { formatSize, shortenString } from "$lib/ts/utils";
  import { STATUS_PENDING, STATUS_APPROVED, STATUS_REJECTED, statusLabel } from "@kredeum/massa-storage-common/src/constants";
  import { ChevronDown, ChevronUp, Check, X, Pin } from "lucide-svelte";
  import { columns } from "$lib/constants/collections";
  import { getContext } from "svelte";
  import type { Ipfs } from "$lib/runes/ipfs.svelte";

  const ipfs: Ipfs = getContext("ipfs");
  let isModerator = $derived.by(() => ipfs?.isModeratorFunc(ipfs?.address));

  let {
    collections = [],
    sortConfig,
    handleSort,
    handleClick
  }: {
    collections: CollectionItem[];
    sortConfig: SortConfig;
    handleSort: (key: keyof CollectionItem) => void;
    handleClick: (collectionCid: string) => void;
  } = $props();

  async function handleModerate(collection: CollectionItem, status: StatusType) {
    if (collection.status == status) return;
    if (status == STATUS_PENDING) return;

    if (status == STATUS_APPROVED) await ipfs.cidValidate(collection.collectionCid);
    if (status == STATUS_REJECTED) await ipfs.cidReject(collection.collectionCid);
  }

  async function handlePin(collection: CollectionItem) {
    // TODO: Implement pin functionality for collections
    console.log("Pin collection:", collection.collectionCid);
  }
</script>

<div class="overflow-x-auto">
  <table class="min-w-full divide-y divide-gray-200">
    <colgroup>
      <col class="w-[25%]" />
      <!-- Name -->
      <col class="w-[15%]" />
      <!-- Date -->
      <col class="w-[10%]" />
      <!-- Files -->
      <col class="w-[10%]" />
      <!-- Size -->
      <col class="w-[10%]" />
      <!-- Owner -->
      <col class="w-[10%]" />
      <!-- Status -->
      <col class="w-[15%]" />
      <!-- CID -->
      <col class="w-[5%]" />
      <!-- Actions -->
    </colgroup>
    <thead class="bg-gray-50">
      <tr>
        {#each columns as { key, label, sortable }}
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500" class:cursor-pointer={sortable} onclick={() => sortable && handleSort(key)}>
            <div class="flex items-center">
              {label}
              {#if sortable && sortConfig.key === key}
                <span class="ml-1">
                  {#if sortConfig.direction === "asc"}
                    <ChevronUp size={16} />
                  {:else}
                    <ChevronDown size={16} />
                  {/if}
                </span>
              {/if}
            </div>
          </th>
        {/each}
        <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-200 bg-white">
      {#each collections as collection}
        <tr class="cursor-pointer hover:bg-gray-50" onclick={() => handleClick(collection.collectionCid)}>
          <td class="whitespace-nowrap px-6 py-4">
            <div class="text-sm font-medium text-gray-900">{collection.name}</div>
          </td>
          <td class="whitespace-nowrap px-6 py-4">
            <div class="text-sm text-gray-900">
              {new Date(collection.creationDate).toLocaleDateString()}
            </div>
          </td>
          <td class="whitespace-nowrap px-6 py-4">
            <div class="text-sm text-gray-900">{collection.filesCount}</div>
          </td>
          <td class="whitespace-nowrap px-6 py-4">
            <div class="text-sm text-gray-900">{formatSize(collection.totalSizeBytes)}</div>
          </td>
          <td class="whitespace-nowrap px-6 py-4">
            <div class="text-sm text-gray-900">{shortenString(collection.owner)}</div>
          </td>
          <td class="whitespace-nowrap px-6 py-4">
            <span
              class="inline-flex rounded-full px-2 text-xs font-semibold leading-5"
              class:bg-yellow-100={collection.status === STATUS_PENDING}
              class:text-yellow-800={collection.status === STATUS_PENDING}
              class:bg-green-100={collection.status === STATUS_APPROVED}
              class:text-green-800={collection.status === STATUS_APPROVED}
              class:bg-red-100={collection.status === STATUS_REJECTED}
              class:text-red-800={collection.status === STATUS_REJECTED}
            >
              {statusLabel(collection.status)}
            </span>
          </td>
          <td class="whitespace-nowrap px-6 py-4">
            <div class="text-sm text-gray-500">{shortenString(collection.collectionCid)}</div>
          </td>
          <td class="whitespace-nowrap px-6 py-4">
            <div class="flex items-center justify-end gap-2">
              {#if isModerator}
                <button
                  onclick={(e) => {
                    e.stopPropagation();
                    handleModerate(collection, "1");
                  }}
                  class="cursor-pointer text-green-600 hover:text-green-900"
                  disabled={collection.status == STATUS_APPROVED}
                >
                  <Check size={22} strokeWidth={3} />
                </button>
                <button
                  onclick={(e) => {
                    e.stopPropagation();
                    handleModerate(collection, "0");
                  }}
                  class="cursor-pointer text-red-600 hover:text-red-900"
                  disabled={collection.status == STATUS_REJECTED}
                >
                  <X size={22} strokeWidth={3} />
                </button>
              {/if}

              <button
                onclick={(e) => {
                  e.stopPropagation();
                  handlePin(collection);
                }}
                class="cursor-pointer transition-colors hover:text-blue-900"
                class:text-blue-600={collection.isPinned}
                class:text-gray-400={!collection.isPinned}
              >
                <Pin size={22} strokeWidth={2} class={!collection.isPinned ? "rotate-45" : ""} />
              </button>
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
