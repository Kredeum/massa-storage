<script lang="ts">
  import { Ipfs } from "$lib/runes/ipfs.svelte";

  const ipfs = new Ipfs();
</script>

<div class="flex h-32 flex-col items-center justify-center">
  <div class="mt-4">
    <button onclick={ipfs.read} class="button-standard">
      Moderators = {ipfs.moderators || "?"}
    </button>
  </div>
</div>
