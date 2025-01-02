<script lang="ts">
  import { ArgTypes, web3 } from "@hicaru/bearby.js";
  import { readU64 } from "$lib/ts/readResult";
  import toast from "svelte-hot-french-toast";
  import { onMount } from "svelte";
  import { COUNTER_ADDRESS } from "$lib/ts/constants";
  import Connect from "$lib/components/Connect.svelte";
  import { wallet } from "$lib/runes/state.svelte";

  let count = $state<bigint | undefined>();
  let txHash = $state<string>();

  const incrementCounter = async () => {
    if (!wallet.connected) return toast.error("Wallet not connected!");

    try {
      txHash = await web3.contract.call({
        maxGas: 200000,
        coins: 0,
        fee: 10000000,
        targetAddress: COUNTER_ADDRESS,
        functionName: "increment",
        parameters: [
          {
            type: ArgTypes.U64,
            value: 1
          }
        ]
        // unsafeParameters: new Args().addU64(1n).serialize()
      });
      console.log(`https://massexplo.io/tx/${txHash}`);

      toast.success("Transaction sent: " + txHash);
    } catch (error) {
      toast.error("Error incrementing counter");
      console.error("Error:", error);
    }
  };

  const readCounter = async (): Promise<bigint | undefined> =>
    (count = readU64(
      await web3.contract.readSmartContract({
        fee: 0,
        maxGas: 4294167295,
        targetAddress: COUNTER_ADDRESS,
        targetFunction: "getCount",
        parameter: []
      })
    ));

  const refreshCounter = async () => {
    await readCounter();
    toast.success("Counter refreshed");
  };

  onMount(() => {
    readCounter();
  });
</script>

<div class="flex h-32 flex-col items-center justify-center">
  <Connect />

  <div class="mt-12 flex items-center space-x-3">
    <button onclick={incrementCounter} class="button-standard">Increment Counter</button>
    <span class="text-lg font-semibold">{count ?? "N/A"}</span>
    <button onclick={refreshCounter} class="button-standard" title="Refresh Counter">↻</button>
  </div>
  <div class="mt-6">
    {#if wallet.address}
      <a href={`https://massexplo.io/address/${wallet.address}`} target="_blank" rel="noopener noreferrer" class="text-sm text-gray-600 hover:text-gray-900"> Explore Wallet </a>
    {/if}
    {#if txHash}
      -
      <a href={`https://massexplo.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" class="text-sm text-gray-600 hover:text-gray-900"> Last Transaction </a>
    {/if}
  </div>
</div>
