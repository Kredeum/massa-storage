<script lang="ts">
  import type { FileItem, SortConfig } from "$lib/ts/types";
  import { columns } from "$lib/constants/files";
  import { ChevronDown, ChevronUp } from "lucide-svelte";

  let {
    selectedFiles = [],
    sortConfig,
    handleSort,
    onSelectionChange,
    filteredFiles = [],
    showSelectionMenu = $bindable(false),
    buttonRef = $bindable<HTMLButtonElement | null>(null)
  } = $props<{
    selectedFiles: string[];
    sortConfig: SortConfig;
    handleSort: (key: keyof FileItem) => void;
    onSelectionChange: (selected: string[]) => void;
    filteredFiles: FileItem[];
    showSelectionMenu?: boolean;
    buttonRef?: HTMLButtonElement | null;
  }>();
</script>

<thead class="bg-gray-50">
  <tr>
    <th scope="col" class="w-12 px-4 py-3">
      <div class="relative flex items-center">
        <input
          type="checkbox"
          class="cursor-pointer rounded text-blue-600"
          checked={selectedFiles.length > 0 && selectedFiles.length === filteredFiles.length}
          indeterminate={selectedFiles.length > 0 && selectedFiles.length < filteredFiles.length}
          onchange={(e) => {
            const checked = e.currentTarget.checked;
            onSelectionChange(checked ? filteredFiles.map((f: FileItem) => f.cid) : []);
          }}
        />
        <button
          bind:this={buttonRef}
          class="rounded hover:bg-gray-100"
          onclick={(e) => {
            e.stopPropagation();
            showSelectionMenu = !showSelectionMenu;
          }}
          aria-expanded={showSelectionMenu}
          aria-haspopup="true"
          aria-label="Selection menu"
        >
          {#if showSelectionMenu}
            <ChevronUp size={16} />
          {:else}
            <ChevronDown size={16} />
          {/if}
        </button>
      </div>
    </th>

    {#each columns as column}
      <th
        scope="col"
        class="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500"
        class:text-left={column.key === "name"}
        class:text-center={column.key !== "name"}
        style="width: {column.key === 'name' ? '25%' : column.key === null ? '13%' : '8%'}"
      >
        <button
          class="inline-flex items-center gap-1"
          class:justify-start={column.key === "name"}
          class:justify-center={column.key !== "name"}
          class:cursor-default={!column.sortable}
          class:hover:text-gray-700={column.sortable}
          onclick={() => column.key && column.sortable && handleSort(column.key)}
        >
          <span>{column.label}</span>
          {#if column.sortable}
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
          {/if}
        </button>
      </th>
    {/each}
  </tr>
</thead>
