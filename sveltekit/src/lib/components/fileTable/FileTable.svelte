<script lang="ts">
  import type { PropsFileTable } from "$lib/ts/types";
  import FileTableRow from "./FileTableRow.svelte";
  import FileTableHeader from "./FileTableHeader.svelte";

  let { files = [], paginatedFiles = [], sortConfig, handleSort, actions }: PropsFileTable = $props();
</script>

<div class="relative w-full overflow-visible">
  <table class="min-w-full divide-y divide-gray-200">
    <colgroup>
      <col class="w-[80%]" />
      <!-- Name -->
      <col class="w-[35%]" />
      <!-- Size -->
      <col class="w-[15%]" />
      <!-- Type -->
      <col class="w-[15%]" />
      <!-- CID -->
      <col class="w-[15%]" />
      <!-- Actions -->
    </colgroup>

    <FileTableHeader {sortConfig} {handleSort} />

    <tbody class="divide-y divide-gray-200 bg-white">
      {#each paginatedFiles as file}
        <FileTableRow {file} {actions} />
      {/each}
    </tbody>
  </table>
</div>
