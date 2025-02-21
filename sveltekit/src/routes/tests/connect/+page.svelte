<script lang="ts">
  import Connect from "$lib/components/Connect.svelte";
  import { Writer } from "$lib/runes/writer.svelte";
  import { BURNER_WALLET_KEY_PINNER } from "$lib/ts/config";
  import { WalletName } from "@massalabs/wallet-provider";

  const client0 = new Writer(); // Bearby #0 by default
  const client1 = new Writer({ privateKey: BURNER_WALLET_KEY_PINNER });
  const client2 = new Writer({ walletName: WalletName.MassaWallet });
  const client3 = new Writer({ walletName: WalletName.MassaWallet, accountNum: 1 });
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
  <div class="p-2">
    <Connect client={client3} />
  </div>
</div>
