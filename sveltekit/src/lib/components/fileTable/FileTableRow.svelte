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

  let { file, actions, onTooltipShow, onTooltipHide } = $props<{
    file: FileItem;
    actions?: import("svelte").Snippet<[FileItem]>;
    onTooltipShow: (content: string, event: MouseEvent) => void;
    onTooltipHide: () => void;
  }>();

  let hoveredPreview = $state(false);

  function handleMouseEnter(e: MouseEvent) {
    if (file.type === "image" || file.type === "video") {
      hoveredPreview = true;
    }
  }

  function handleMouseLeave() {
    hoveredPreview = false;
  }
</script>

<tr class="hover:bg-gray-50">
  {#each columns as column}
    {#if column.key === "name"}
      <td class="w-[25%] px-4 py-[18px]">
        <div class="flex items-center">
          <FileIcon type={file.type} />
          <div class="relative inline-block">
            <div class="ml-2 cursor-pointer text-sm font-medium text-gray-600 hover:text-blue-600" role="button" tabindex="0" onmouseenter={handleMouseEnter} onmouseleave={handleMouseLeave}>
              {shortenString(file.name)}
            </div>
            {#if hoveredPreview && (file.type === "image" || file.type === "video")}
              <FilePreview {file} />
            {/if}
          </div>
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
