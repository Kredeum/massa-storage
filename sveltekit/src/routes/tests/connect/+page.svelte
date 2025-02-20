<script lang="ts">
  import Connect from "$lib/components/Connect.svelte";
  import { Writer } from "$lib/runes/writer.svelte";
  import { WalletName } from "@massalabs/wallet-provider";

  const client = new Writer({ walletName: WalletName.Bearby });
</script>

<div class="flex h-32 flex-col items-center justify-center">
  <Connect {client} />
</div>
