<script lang="ts">
  import type { FileItem } from "$lib/ts/types";
  import { onDestroy } from "svelte";

  let { file } = $props<{
    file: FileItem;
  }>();

  const objectUrl = URL.createObjectURL(file.blob);
  onDestroy(() => {
    if (file.blob) {
      URL.revokeObjectURL(objectUrl);
    }
  });
</script>

{#if file.blob}
  <div class="absolute z-50 rounded-lg border border-gray-200 bg-white p-2 shadow-lg" style="bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 8px; width: 200px; height: 150px;">
    <img src={objectUrl} alt={file.name} class="h-full w-full object-contain" />
  </div>
{/if}
