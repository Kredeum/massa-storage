<script lang="ts">
  import { Toaster } from "svelte-hot-french-toast";

  import Connect from "$lib/components/Connect.svelte";
  import { wallet } from "$lib/runes/state.svelte";
</script>

<Toaster />

<div class="flex h-32 flex-col items-center justify-center">
  <Connect />

  <div class="mt-4">
    connected = {wallet.connected}
  </div>
  <div class="mt-4">
    addr = {wallet.address}
  </div>
</div>
