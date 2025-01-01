<!-- Counter.svelte -->
<script lang="ts">
  import { toast } from "svelte-hot-french-toast";
  import { web3 } from "@hicaru/bearby.js";
  import { wallet } from "$lib/runes/state.svelte";

  let connected: boolean = $state(web3.wallet.connected);
  const CONTRACT_ADDRESS = "AS12b4pgVgvF9GKL6S8wZ6AEKENeqihZ8Qmxkr5NT4Ho7wYp9D9NT";

  const increment = async () => {
    if (!web3.wallet.connected) return toast.error("Wallet not connected");

    try {
      const result = await web3.contract.call({
        maxGas: 200000,
        coins: 0,
        fee: 0,
        targetAddress: CONTRACT_ADDRESS,
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
    <button onclick={increment} class="button-standard"> Increment Counter </button>
  {:else}
    Connect to use Counter
  {/if}
</div>
