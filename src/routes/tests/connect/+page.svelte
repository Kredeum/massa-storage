<script lang="ts">
  import Connect from "$lib/components/Connect.svelte";
  import { wallet } from "$lib/runes/state.svelte";
</script>

<div class="flex h-32 flex-col items-center justify-center">
  <Connect />

  <div class="mt-4">
    {#if wallet.connected}
      address = {wallet.address}<br />
      balance = {wallet.balance}
    {:else}
      not connected
    {/if}
  </div>
</div>
