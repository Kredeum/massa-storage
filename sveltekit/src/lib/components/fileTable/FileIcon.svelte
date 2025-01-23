<script lang="ts">
  import type { FileType } from "$lib/ts/types";
  import { FileText, Image, Video, Music } from "lucide-svelte";

  let { type } = $props<{
    type: FileType;
  }>();
</script>

{#if type === "image"}
  <Image class="mr-2 h-5 w-5 text-blue-500" />
{:else if type === "video"}
  <Video class="mr-2 h-5 w-5 text-purple-500" />
{:else if type === "audio"}
  <Music class="mr-2 h-5 w-5 text-green-500" />
{:else}
  <FileText class="mr-2 h-5 w-5 text-gray-500" />
{/if}
