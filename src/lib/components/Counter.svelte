<!-- Counter.svelte -->
<script lang="ts">
  import { toast } from "svelte-hot-french-toast";
  import { type JsonRPCResponseExecuteReadOnly } from "@hicaru/bearby.js";
  import { web3 } from "@hicaru/bearby.js";
  import { readU64 } from "$lib/ts/readResult";
  import { wallet } from "$lib/runes/state.svelte";
  import { COUNTER_ADDRESS } from "$lib/ts/constants";

  const readCounter = async () => {
    const data: JsonRPCResponseExecuteReadOnly[] = await web3.contract.readSmartContract({
      fee: 0,
      maxGas: 4294167295,
      targetAddress: "AS1CNmKBzXY3jwkqempmrv95wZUMqBHRBAQK3G4vicb3WpxZAy3e",
      targetFunction: "getMessage",
      parameter: [],
      callerAddress: wallet.address
    });
    const count = readU64(data);
    console.log("readCounter count", count);
  };

  const increment = async () => {
    if (!wallet.connected) return toast.error("Wallet not connected");

    try {
      const result = await web3.contract.call({
        maxGas: 200000,
        coins: 0,
        fee: 10000000,
        targetAddress: COUNTER_ADDRESS,
        functionName: "increment",
        parameters: []
      });

      toast.success("Transaction sent: " + result);
    } catch (error) {
      toast.success("Error incrementing counter");
      console.error("Error:", error);
    }
  };
</script>

<div class="flex flex-col items-center justify-center gap-4">
  {#if wallet.connected}
    <button onclick={readCounter} class="button-standard"> Read Counter </button>
    <button onclick={increment} class="button-standard"> Increment Counter </button>
  {:else}
    Connect to Increment Counter
  {/if}
</div>
