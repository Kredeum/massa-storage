<script lang="ts">
  import Connect from "$lib/components/Connect.svelte";
  import { WalletProvider, Writer } from "$lib/runes/writer.svelte";
  import { WalletName } from "@massalabs/wallet-provider";

  const client0 = new Writer(); // Bearby #0 by default
  const client1 = new Writer(new WalletProvider(WalletName.MassaWallet));
  const client2 = new Writer(new WalletProvider(WalletName.MassaWallet, 1));
</script>

<div class="flex h-32 flex-col items-center justify-center">
  <div class="p-2">
    <Connect client={client0} />
  </div>
  <div class="p-2">
    <Connect client={client1} />
  </div>
  <div class="p-2">
    <Connect client={client2} />
  </div>
</div>
