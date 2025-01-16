<script lang="ts">
  import Connect from "$lib/components/Connect.svelte";
  import { Account, Web3Provider } from "@massalabs/massa-web3";
  import { BURNER_WALLET_KEY } from "$lib/ts/config";
  import { Client } from "$lib/runes/client.svelte";

  const client = new Client();

  const init = async () => {
    const account = await Account.fromPrivateKey(BURNER_WALLET_KEY);
    console.log("address:", account.address.toString());
    console.log("public key:", account.publicKey.toString());
    console.log("private key:", account.privateKey.toString());

    const provider = Web3Provider.buildnet(account);

    console.log(provider);
    console.log(provider.address);
    console.log("balance", await provider.balance());

    console.log("network", await provider.networkInfos());
  };
  init();
</script>

<div class="flex h-32 flex-col items-center justify-center">
  <Connect {client} />
</div>
