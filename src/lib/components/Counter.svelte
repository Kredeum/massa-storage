<!-- Counter.svelte -->
<script lang="ts">
  import { toast } from "@zerodevx/svelte-toast";
  import { web3 } from "@hicaru/bearby.js";

  let connected: boolean = $state(web3.wallet.connected);
  const CONTRACT_ADDRESS = "AS12b4pgVgvF9GKL6S8wZ6AEKENeqihZ8Qmxkr5NT4Ho7wYp9D9NT";

  const increment = async () => {
    if (!web3.wallet.connected) return toast.push("Wallet not connected");

    try {
      const result = await web3.contract.call({
        maxGas: 200000,
        coins: 0,
        fee: 0,
        targetAddress: CONTRACT_ADDRESS,
        functionName: "increment",
        parameters: []
      });

      toast.push("Transaction sent: " + result);
    } catch (error) {
      toast.push("Error incrementing counter");
      console.error("Error:", error);
    }
  };
</script>

<div class="flex flex-col items-center justify-center gap-4">
  {#if connected}
    <button
      onclick={increment}
      class="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      Increment Counter
    </button>
  {:else}
    Connect to use Counter
  {/if}
</div>
