<script lang="ts">
  import type { CollectionItem, SortConfig, StatusType } from "$lib/ts/types";
  import { formatDate, formatSize } from "$lib/ts/utils";
  import { statusLabel, STATUS_APPROVED, STATUS_PENDING, STATUS_REJECTED } from "@kredeum/massa-storage-common/src/constants";
  import TimeTooltip from "$lib/components/fileTable/TimeTooltip.svelte";
  import ShortenedTextTooltip from "$lib/components/common/ShortenedTextTooltip.svelte";
  import { ChevronDown, ChevronUp } from "lucide-svelte";
  import { columns } from "$lib/constants/collections";
  import ButtonActions from "$lib/components/common/ButtonActions.svelte";
  import { createKuboClient } from "$lib/ts/kubo";

  let {
    collections = [],
    sortConfig,
    handleSort,
    handleClick,
    onModerate,
    onPin
  }: {
    collections: CollectionItem[];
    sortConfig: SortConfig;
    handleSort: (key: keyof CollectionItem) => void;
    handleClick: (collectionCid: string) => void;
    onModerate?: (data: { id: string; status: StatusType }) => void;
    onPin: (id: string) => void;
  } = $props();

  const kubo = createKuboClient();

  const countPeers = async (cid: string) => await kubo.countPeers(cid);
</script>

<div class="overflow-x-auto">
  <table class="min-w-full divide-y divide-gray-200">
    <colgroup>
      <col class="w-[25%] min-w-[120px]" />
      <!-- Name -->
      <col class="w-[15%] min-w-[100px]" />
      <!-- Date -->
      <col class="w-[10%] min-w-[60px]" />
      <!-- Files -->
      <col class="w-[10%] min-w-[60px]" />
      <!-- Peers -->
      <col class="w-[10%] min-w-[60px]" />
      <!-- Size -->
      <col class="w-[10%] min-w-[80px]" />
      <!-- Owner -->
      <col class="w-[10%] min-w-[80px]" />
      <!-- Status -->
      <col class="w-[15%] min-w-[100px]" />
      <!-- CID -->
      <col class="sticky right-0 w-[5%] min-w-[100px]" />
      <!-- Actions -->
    </colgroup>
    <thead class="bg-gray-50">
      <tr>
        {#each columns as { key, label, sortable }}
          <th class="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500" class:text-left={key === "name"} class:text-center={key !== "name"}>
            <button
              class="inline-flex w-full items-center gap-1"
              class:justify-start={key === "name"}
              class:justify-center={key !== "name"}
              class:cursor-default={!sortable}
              class:hover:text-gray-700={sortable}
              onclick={() => sortable && handleSort(key)}
            >
              <span>{label}</span>
              {#if sortable && key !== "name"}
                <span class="ml-1">
                  {#if sortConfig.key === key}
                    {#if sortConfig.direction === "asc"}
                      <ChevronDown class="h-4 w-4" />
                    {:else}
                      <ChevronUp class="h-4 w-4" />
                    {/if}
                  {:else}
                    <svg class="h-3.5 w-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 12h16" />
                    </svg>
                  {/if}
                </span>
              {/if}
            </button>
          </th>
        {/each}
        <th class="sticky right-0 bg-gray-50 px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]">Actions</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-200 bg-white">
      {#each collections as collection}
        <tr class="cursor-pointer hover:bg-gray-50" onclick={() => handleClick(collection.collectionCid)}>
          <td class="w-[25%] px-4 py-4">
            <div class="text-sm font-medium text-gray-600">{collection.name}</div>
          </td>
          <td class="w-[15%] px-4 py-4 text-center text-sm text-gray-500">
            {#if collection.timestamp}
              {@const formattedDate = formatDate(collection.timestamp)}
              <TimeTooltip text={formattedDate.split(" ")[0]} tooltip={formattedDate.split(" ")[1]} />
            {:else}
              <span>No Date Available</span>
            {/if}
          </td>
          <td class="w-[8%] px-4 py-4 text-center text-sm text-gray-500">
            {collection.filesCount >= 0 ? collection.filesCount : "?"}
          </td>
          <td class="w-[8%] px-4 py-4 text-center text-sm text-gray-500">
            {#await countPeers(collection.collectionCid)}
              <span class="text-gray-500">?</span>
            {:then count}
              <span>{count}</span>
            {:catch}
              <span class="text-gray-500">X</span>
            {/await}
          </td>
          <td class="w-[8%] px-4 py-4 text-center text-sm text-gray-500">
            {collection.totalSizeBytes >= 0 ? formatSize(collection.totalSizeBytes) : "?"}
          </td>
          <td class="w-[10%] px-4 py-4 text-center text-sm text-gray-500">
            <ShortenedTextTooltip text={collection.owner} label="Owner address" />
          </td>
          <td class="whitespace-nowrap px-6 py-4">
            <div class="text-sm text-gray-500"><ShortenedTextTooltip text={collection.collectionCid} label="Collection CID" /></div>
          </td>
          <td class="whitespace-nowrap px-6 py-4 text-center">
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
          <td class="sticky right-0 whitespace-nowrap bg-white px-6 py-4 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]">
            <div class="flex items-center justify-end gap-2">
              <ButtonActions item={collection} {onModerate} {onPin} type="collection" />
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
