<script lang="ts">
  import { toast } from "@zerodevx/svelte-toast";
  import { Wallet, web3 } from "@hicaru/bearby.js";
  import { onMount, tick } from "svelte";

  let refresh = $state(0);
  const connected = $derived<boolean>(refresh > 0 && web3.wallet.connected);

  let address = $state<string>();
  const shortAddress = $derived(address ? `${address.slice(0, 6)}...${address.slice(-6)}` : "");

  const disconnectBearby = async () => {
    if (!web3.wallet.installed) return toast.push("Wallet not installed");
    if (!web3.wallet.enabled) return toast.push("Wallet not enabled");
    if (!web3.wallet.connected) return toast.push("Wallet not connected");

    try {
      await web3.wallet.disconnect();
      toast.push(`Wallet disconnected`);
    } catch (error) {
      toast.push("Error disconnecting to Wallet");
      console.error("Wallet Error:", error);
    }
    refresh++;
  };

  const connectBearby = async () => {
    console.log("connectBearby ~ web3.wallet:", web3.wallet);
    console.log("connectBearby ~ connected:", web3.wallet.connected);

    if (!web3.wallet.installed) return toast.push("Wallet not installed");
    if (!web3.wallet.enabled) return toast.push("Wallet not enabled");
    if (web3.wallet.connected) return toast.push(`Wallet already connected<br/>${shortAddress}`);

    try {
      await web3.wallet.connect();
      address = web3.wallet.account.base58;
      toast.push(`Wallet ${shortAddress} connected`);
    } catch (error) {
      toast.push("Error connecting to Wallet");
      console.error("Wallet Error:", error);
    }
    refresh++;
  };

  const init = async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("onMount ~ web3.wallet:", web3.wallet, "web3.wallet.connected:", web3.wallet.connected);
    refresh++;
  };

  onMount(init);
</script>

{#if connected}
  <div class="flex items-center gap-2">
    <span class="text-sm font-medium text-gray-700">{shortAddress}</span>
    <button onclick={disconnectBearby} class="connect-button"> Disconnect </button>
  </div>
{:else}
  <button onclick={connectBearby} class="connect-button"> Connect </button>
{/if}

<style lang="postcss">
  .connect-button {
    @apply rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600;
  }
</style>
