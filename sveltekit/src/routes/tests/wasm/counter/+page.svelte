<script lang="ts">
  import Connect from "$lib/components/Connect.svelte";
  import { Counter } from "$lib/runes/counter.svelte";

  const counter = new Counter();
</script>

<div class="flex h-32 flex-col items-center justify-center">
  <div class="mt-4">
    <Connect client={counter} />
  </div>

  <div class="mt-4">
    <button onclick={counter.read} class="button-standard">Count = {counter.count || "?"}</button>
    {#if counter.connected}
      <button onclick={counter.increment} class="button-standard">Increment</button>
    {/if}
  </div>
</div>
