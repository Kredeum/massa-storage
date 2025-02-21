<script lang="ts">
  import type { PropsFileTable } from "$lib/ts/types";
  import FileTableHeader from "./FileTableHeader.svelte";
  import FileTableRow from "./FileTableRow.svelte";
  import FileSelectionMenu from "./FileSelectionMenu.svelte";
  import FileTooltip from "./FileTooltip.svelte";

  let { files = [], paginatedFiles = [], selectedFiles = $bindable([]), sortConfig, handleSort, onSelectionChange, actions, filteredFiles = [] }: PropsFileTable = $props();

  let showSelectionMenu = $state(false);
  let buttonRef = $state<HTMLButtonElement | null>(null);
  let tooltipContent = $state("");
  let tooltip: FileTooltip;

  function handleSelect(fileCid: string) {
    console.log("CIDCID", fileCid);
    const newSelected = selectedFiles.includes(fileCid) ? selectedFiles.filter((selectedId) => selectedId !== fileCid) : [...selectedFiles, fileCid];
    console.log("newSelected", newSelected); // newSelected
    selectedFiles = newSelected;
    onSelectionChange(newSelected);
  }

  function handleTooltipShow(content: string, event: MouseEvent) {
    tooltipContent = content;
    tooltip?.show(event);
  }
</script>

<div class="w-full">
  <div class="min-w-full overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <colgroup>
        <col class="w-6" />
        <!-- Checkbox -->
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

      <FileTableHeader {selectedFiles} {sortConfig} {handleSort} {onSelectionChange} {filteredFiles} bind:buttonRef bind:showSelectionMenu />

      <tbody class="divide-y divide-gray-200 bg-white">
        {#each paginatedFiles as file}
          <FileTableRow
            {file}
            {selectedFiles}
            onSelect={handleSelect}
            {actions}
            onTooltipShow={(content: string, event: MouseEvent) => handleTooltipShow(content, event)}
            onTooltipHide={() => tooltip?.hide()}
          />
        {/each}
      </tbody>
    </table>
  </div>

  <FileSelectionMenu {files} {paginatedFiles} {onSelectionChange} showMenu={showSelectionMenu} {buttonRef} onClose={() => (showSelectionMenu = false)} />

  <FileTooltip bind:this={tooltip} content={tooltipContent} />
</div>
