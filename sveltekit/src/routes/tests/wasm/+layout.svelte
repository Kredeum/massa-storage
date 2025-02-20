<script lang="ts">
  import { page } from "$app/state";
  import { setContext } from "svelte";
  import { Ipfs } from "$lib/runes/ipfs.svelte";
  import Connect from "$lib/components/Connect.svelte";

  const ipfs = new Ipfs();
  setContext("ipfs", ipfs);

  let { children } = $props();
</script>

<h1 class="mb-6 text-2xl">
  <Connect client={ipfs} />
</h1>

<main class="relative flex flex-1 flex-col">{@render children()}</main>
