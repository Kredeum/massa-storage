<!-- Counter.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { toast } from "svelte-hot-french-toast";
  import { Args, Account, OperationStatus, Web3Provider, type ReadSCData } from "@massalabs/massa-web3";
  import { getWallets, type Wallet } from "@massalabs/wallet-provider";

  import { BURNER_WALLET_KEY, COUNTER_ADDRESS } from "$lib/ts/config";
  import { account } from "$lib/runes/account.svelte";

  let count = $state<bigint | undefined>();
  let txHash = $state<string>();

  const readCounter = async () => {
    const account = await Account.fromPrivateKey(BURNER_WALLET_KEY);
    const provider = Web3Provider.buildnet(account);

    const result: ReadSCData = await provider.readSC({
      func: "getCount",
      target: COUNTER_ADDRESS
    });

    if (result.info.error) return toast.error("readCounter ERROR " + result.info.error);

    count = new Args(result.value).nextU64();
  };

  const refreshCounter = async () => {
    await readCounter();
    toast.success("Counter refreshed");
  };

  const incrementCounter = async () => {
    const wallets: Wallet[] = await getWallets();
    if (wallets.length === 0) return toast.error("No Wallet found");
    const wallet: Wallet = wallets[0];

    const accounts = await wallet.accounts();
    if (accounts.length === 0) return toast.error("No Account found in Wallet");
    const provider = accounts[0];

    try {
      const op = await provider.callSC({
        parameter: new Args().addU64(1n).serialize(),
        func: "increment",
        target: COUNTER_ADDRESS
      });
      // console.info("incrementCounter ~ op:", op);

      txHash = op.id;
      toast.success("Transaction sent: " + txHash);
      console.log(`https://massexplo.io/tx/${txHash}`);
      // console.log(`https://explorer.massa.net/mainnet/operation/${txHash}`);

      const status = await op.waitSpeculativeExecution();
      if (status !== OperationStatus.SpeculativeSuccess) return toast.error("Failed to increment count");

      readCounter();
    } catch (error) {
      toast.error("Error incrementing counter");
      console.error("Error:", error);
    }
  };

  onMount(readCounter);
</script>

<div class="mt-12 flex items-center space-x-3">
  {#if account.connected}
    <button onclick={incrementCounter} class="button-standard">Increment Counter</button>
    <span class="text-lg font-semibold">{count ?? "???"}</span>
    <button onclick={refreshCounter} class="button-standard" title="Refresh Counter">↻</button>
  {:else}
    Connect to Increment Counter
  {/if}
</div>
