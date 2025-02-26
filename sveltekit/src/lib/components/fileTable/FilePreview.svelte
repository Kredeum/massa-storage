<script lang="ts">
  import type { FileItem } from "$lib/ts/types";
  import { onDestroy } from "svelte";

  let { file, onPlay, onPause } = $props<{
    file: FileItem;
    onPlay?: () => void;
    onPause?: () => void;
  }>();

  const objectUrl = URL.createObjectURL(file.blob);

  onDestroy(() => {
    if (file.blob) {
      URL.revokeObjectURL(objectUrl);
    }
  });
</script>

{#if file.blob}
  <div
    class="absolute z-[9999]"
    style="bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 8px;"
    class:h-[200px]={file.type === "image" || file.type === "video"}
    class:h-[100px]={file.type === "audio"}
    class:h-[150px]={file.type === "document"}
    class:w-[300px]={file.type === "image" || file.type === "video"}
    class:w-[250px]={file.type === "audio"}
    class:w-[200px]={file.type === "document"}
  >
    {#if file.type === "image"}
      <img src={objectUrl} alt={file.name} class="h-full w-full object-contain" />
    {:else if file.type === "video"}
      <video src={objectUrl} autoplay playsinline loop class="h-full w-full object-cover">
        <track kind="captions" />
      </video>
    {:else if file.type === "audio"}
      <div class="flex flex-col items-center justify-center gap-4">
        <audio src={objectUrl} controls autoplay class="w-full">
          <track kind="captions" />
        </audio>
      </div>
    {:else if file.type === "document"}
      {#if file.blob.type === "application/pdf"}
        <div class="h-full w-full overflow-hidden rounded-lg bg-white">
          <embed src={objectUrl} type="application/pdf" class="h-full w-full rounded-lg" />
        </div>
      {:else}
        <div class="flex flex-col items-center justify-center gap-4 rounded-lg bg-black/80 p-4 text-gray-300 backdrop-blur">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span class="text-sm">{file.name}</span>
        </div>
      {/if}
    {/if}
  </div>
{/if}
