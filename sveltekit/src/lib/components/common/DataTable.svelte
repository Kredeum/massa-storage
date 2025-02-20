<script lang="ts">
  import type { SortConfig } from "$lib/ts/types";
  import { shortenString, formatSize, formatDate } from "$lib/ts/utils";
  import { STATUS_PENDING, STATUS_APPROVED, STATUS_REJECTED, statusLabel } from "@kredeum/massa-storage-common/src/constants";

  export let items: any[] = [];
  export let columns: Array<{
    key: string;
    label: string;
    sortable?: boolean;
    formatter?: (value: any) => string;
  }> = [];
  export let sortConfig: SortConfig;
  export let handleSort: (key: string) => void;
  export let handleClick: (item: any) => void;
</script>

<div class="overflow-x-auto">
  <table class="min-w-full divide-y divide-gray-200">
    <thead class="bg-gray-50">
      <tr>
        {#each columns as column}
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500" class:cursor-pointer={column.sortable} onclick={() => column.sortable && handleSort(column.key)}>
            {column.label}
            {#if column.sortable && sortConfig.key === column.key}
              <span class="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
            {/if}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-200 bg-white">
      {#each items as item}
        <tr class="hover:bg-gray-50" class:cursor-pointer={handleClick} onclick={() => handleClick?.(item)}>
          {#each columns as column}
            <td class="whitespace-nowrap px-6 py-4">
              {#if column.key === "status"}
                <span
                  class="inline-flex rounded-full px-2 text-xs font-semibold leading-5"
                  class:bg-yellow-100={item[column.key] === STATUS_PENDING}
                  class:text-yellow-800={item[column.key] === STATUS_PENDING}
                  class:bg-green-100={item[column.key] === STATUS_APPROVED}
                  class:text-green-800={item[column.key] === STATUS_APPROVED}
                  class:bg-red-100={item[column.key] === STATUS_REJECTED}
                  class:text-red-800={item[column.key] === STATUS_REJECTED}
                >
                  {statusLabel(item[column.key])}
                </span>
              {:else if column.formatter}
                <div class="text-sm text-gray-900">
                  {column.formatter(item[column.key])}
                </div>
              {:else}
                <div class="text-sm text-gray-900">
                  {item[column.key]}
                </div>
              {/if}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
