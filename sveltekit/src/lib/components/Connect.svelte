<script lang="ts">
  import { Client } from "$lib/runes/client.svelte";
  import { onMount } from "svelte";

  const { client }: { client: Client } = $props();

  onMount(client.connect);
</script>

<div class="flex items-center gap-2 text-sm font-medium text-gray-700">
  {#if client.connected}
    <div class="flex flex-col items-center justify-center">
      <span>{client.addressToDisplay}</span>
      <span>{client.balanceToDisplay}</span>
    </div>
    <button id="button-refresh" onclick={client.refresh} class="button-standard" title="Refresh Balance">↻</button>
    <button id="button-disconnect" onclick={client.disconnect} class="button-standard">Disconnect</button>
  {:else}
    <button id="button-connect" onclick={client.connect} class="button-standard">Connect</button>
  {/if}
  <div class="flex flex-col items-center justify-center">
    <span id="network-name">{client.networkName}</span>
    <span id="wallet-name">{client.walletName}</span>
  </div>
</div>
