<script lang="ts">
  import type { FileItem } from "$lib/ts/types";
  import { columns } from "$lib/constants/files";
  import FileIcon from "./FileIcon.svelte";
  import FileCidCell from "./FileCidCell.svelte";
  import FilePreview from "$lib/components/fileTable/FilePreview.svelte";
  import TimeTooltip from "./TimeTooltip.svelte";
  import { STATUS_PENDING, STATUS_APPROVED, STATUS_REJECTED, statusLabel } from "@kredeum/massa-storage-common/src/constants";

  import { shortenString } from "$lib/ts/utils";
  import { formatSize } from "$lib/ts/utils";

  let {
    file,
    selectedFiles = [],
    onSelect,
    actions,
    onTooltipShow,
    onTooltipHide
  } = $props<{
    file: FileItem;
    selectedFiles: string[];
    onSelect: (id: string) => void;
    actions?: import("svelte").Snippet<[FileItem]>;
    onTooltipShow: (content: string, event: MouseEvent) => void;
    onTooltipHide: () => void;
  }>();

  let hoveredPreview = $state(false);

  function handleRowClick() {
    onSelect(file.cid);
  }

  function handleCheckboxClick(e: Event) {
    e.stopPropagation();
    onSelect(file.cid);
  }

  function handleMouseEnter(e: MouseEvent) {
    if (file.type === "image") {
      hoveredPreview = true;
    }
  }

  function handleMouseLeave() {
    hoveredPreview = false;
  }
</script>

<tr
  class="cursor-pointer"
  onclick={handleRowClick}
  onkeydown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleRowClick();
    }
  }}
  role="button"
  tabindex="0"
>
  <td class="w-12 px-4 py-[18px]">
    <input
      type="checkbox"
      class="cursor-pointer rounded text-blue-600"
      checked={selectedFiles.includes(file.cid)}
      onclick={handleCheckboxClick}
      onkeydown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCheckboxClick(e);
        }
      }}
      aria-label={`Select ${file.name}`}
    />
  </td>

  {#each columns as column}
    {#if column.key === "name"}
      <td class="w-[25%] px-4 py-[18px]">
        <div class="flex items-center">
          <FileIcon type={file.type} />
          <div class="ml-2 text-sm font-medium text-gray-600 hover:text-blue-600">{shortenString(file.name)}</div>
        </div>
      </td>
    {:else if column.key === "sizeInBytes"}
      <td class="w-[15%] px-4 py-[18px] text-center text-sm text-gray-500">{formatSize(file.sizeInBytes)}</td>
    {:else if column.key === "type"}
      <td class="w-[15%] px-4 py-[18px] text-center text-sm text-gray-500">{file.type}</td>
    {:else if !column.key}
      <td class="w-[15%] px-4 py-[18px] text-center text-sm text-gray-500">
        <FileCidCell cid={file.cid} fileName={file.name} {onTooltipShow} {onTooltipHide} />
      </td>
    {/if}
  {/each}

  <td class="w-[15%] px-4 py-[18px] text-center">
    <div class="flex items-center justify-center space-x-2">
      {@render actions?.(file)}
    </div>
  </td>
</tr>
