<script lang="ts">
  import type { FileItem } from "$lib/ts/types";
  import { columns } from "$lib/constants/files";
  import FileIcon from "./FileIcon.svelte";
  import FileCidCell from "./FileCidCell.svelte";
  import FilePreview from "$lib/components/fileTable/FilePreview.svelte";
  import TimeTooltip from "./TimeTooltip.svelte";
  import { X } from "lucide-svelte";
  import { FileStore } from "$lib/runes/FileStore.svelte";
  import { formatSize } from "$lib/ts/utils";

  const fileStore = new FileStore();

  let {
    file,
    selectedFiles = [],
    onSelect,
    actions,
    onTooltipShow,
    onTooltipHide
  } = $props<{
    file: FileItem;
    selectedFiles: number[];
    onSelect: (id: number) => void;
    actions?: import("svelte").Snippet<[FileItem]>;
    onTooltipShow: (content: string, event: MouseEvent) => void;
    onTooltipHide: () => void;
  }>();

  let hoveredPreview = $state(false);

  function handleRowClick() {
    onSelect(file.id);
  }

  function handleCheckboxClick(e: Event) {
    e.stopPropagation();
    onSelect(file.id);
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
  <td class="w-12 px-4 py-4">
    <input
      type="checkbox"
      class="cursor-pointer rounded text-blue-600"
      checked={selectedFiles.includes(file.id)}
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
      <td class="w-[25%] px-4 py-4">
        <div class="flex items-center">
          <FileIcon type={file.type} />
          <span class="ml-2 cursor-pointer truncate hover:text-blue-600" onmouseenter={handleMouseEnter} onmouseleave={handleMouseLeave} role="button" tabindex="0">
            {file.name}
          </span>
          {#if hoveredPreview}
            <FilePreview {file} />
          {/if}
        </div>
      </td>
    {:else if column.key === "tags"}
      <td class="w-[15%] px-4 py-4 text-center">
        <div class="flex flex-wrap items-center justify-center gap-1">
          {#each file.tags || [] as tag}
            <div class="inline-flex items-center rounded-full bg-blue-100 px-2 text-xs text-blue-800">
              <span class="flex items-center justify-center">
                {tag}
              </span>
              <!-- <button
                class="cursor-pointer text-gray-500 transition-colors hover:text-blue-900"
                onclick={(e) => {
                  e.stopPropagation();
                  handleTagRemove(tag, [file.id]);
                }}
              >
                <X size={10} strokeWidth={2} />
              </button> -->
            </div>
          {/each}
        </div>
      </td>
    {:else if column.key === "uploadDate"}
      <td class="w-[15%] px-4 py-4 text-center text-sm text-gray-500">
        <!-- <TimeTooltip text={file.uploadDate.split(" ")[0].split("-").reverse().join("/")} tooltip={file.uploadDate.split(" ")[1]} /> -->
      </td>
    {:else if column.key === "size"}
      <td class="w-[8%] cursor-default px-4 py-4 text-center text-sm text-gray-500">
        {formatSize(file.sizeInBytes)}
      </td>
    {:else if column.key === "type"}
      <td class="w-[8%] cursor-default px-4 py-4 text-center text-sm text-gray-500">
        {file.type}
      </td>
    {:else if column.key === "status"}
      <td class="w-[8%] cursor-default px-4 py-4 text-center">
        <span
          class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
          class:bg-yellow-100={file.status === "Pending"}
          class:text-yellow-800={file.status === "Pending"}
          class:bg-green-100={file.status === "Approved"}
          class:text-green-800={file.status === "Approved"}
          class:bg-red-100={file.status === "Rejected"}
          class:text-red-800={file.status === "Rejected"}
        >
          {file.status}
        </span>
      </td>
    {:else if !column.key}
      <td class="w-[13%] px-4 py-4 text-center">
        <FileCidCell cid={file.cid} fileName={file.name} {onTooltipShow} {onTooltipHide} />
      </td>
    {/if}
  {/each}

  <td class="w-[8%] px-4 py-4 text-center">
    <div class="flex items-center justify-center space-x-2">
      {@render actions?.(file)}
    </div>
  </td>
</tr>
