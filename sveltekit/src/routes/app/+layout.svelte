<script lang="ts">
  import "$styles/toast.css";
  import { setContext } from "svelte";

  import { Ipfs } from "$lib/runes/ipfs.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Header from "$lib/components/Header.svelte";

  const ipfs = new Ipfs();
  setContext("ipfs", ipfs);

  let { children } = $props();
</script>

<Header client={ipfs} />

{#if ipfs.connected}
  {@render children()}
{:else}
  <div class="flex flex-col items-center justify-center p-8 text-center">
    <p id="text-log" class="mb-4 text-lg font-medium text-gray-700">Please Connect to enter the App</p>
    <p class="text-sm text-gray-500">Use the "Connect" button at the top of the page to log in with your wallet</p>
  </div>
{/if}

<Footer />
