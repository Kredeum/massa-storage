<!-- /root/massa-storage/src/routes/preview/[id]/+page.svelte -->
<script lang="ts">
  import { page } from "$app/stores";
  import { Download } from "lucide-svelte";

  let { data } = $props();
  const { file } = data;
</script>

<div class="relative min-h-screen bg-gray-900 p-4">
  <div class="absolute right-4 top-4">
    <a href={file.url} download={file.name} class="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-white hover:bg-white/20">
      <Download class="h-5 w-5" />
      <span>Download</span>
    </a>
  </div>

  <div class="flex h-[calc(100vh-2rem)] items-center justify-center">
    {#if file.type === "image"}
      <img src={file.url} alt={file.name} class="max-h-full max-w-full rounded-lg object-contain" />
    {:else if file.type === "video"}
      <video src={file.url} class="max-h-full max-w-full rounded-lg bg-black object-contain" controls autoplay>
        <track kind="captions" label="No captions available" src="data:text/vtt,WEBVTT" />
      </video>
    {/if}
  </div>
</div>
