<script lang="ts">
  import type { FileItem, SortConfig } from "$lib/ts/types";
  import { columns } from "$lib/constants/files";
  import { ChevronDown, ChevronUp } from "lucide-svelte";

  let { sortConfig, handleSort } = $props<{
    sortConfig: SortConfig;
    handleSort: (key: keyof FileItem) => void;
  }>();
</script>

<thead class="bg-gray-50">
  <tr>
    {#each columns as column}
      <th
        scope="col"
        class="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500"
        class:text-left={column.key === "name"}
        class:text-center={column.key !== "name"}
        style="width: {column.key === 'name' ? '25%' : column.key === null ? '13%' : '8%'}"
      >
        {#if column.sortable}
          <button
            class="inline-flex w-full items-center gap-1"
            class:justify-start={column.key === "name"}
            class:justify-center={column.key !== "name"}
            class:hover:text-gray-700={column.sortable}
            onclick={() => column.key && handleSort(column.key)}
          >
            <span>{column.label}</span>
            <span class="ml-1">
              {#if sortConfig.key === column.key}
                {#if sortConfig.direction === "desc"}
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
          </button>
        {:else}
          <div class="inline-flex w-full items-center gap-1" class:justify-start={column.key === "name"} class:justify-center={column.key !== "name"}>
            <span>{column.label}</span>
          </div>
        {/if}
      </th>
    {/each}
  </tr>
</thead>
