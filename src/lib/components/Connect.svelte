<script lang="ts">
  import { onDestroy, onMount, setContext } from "svelte";
  import { toast } from "svelte-hot-french-toast";
  import { web3 } from "@hicaru/bearby.js";

  import { wallet } from "$lib/runes/state.svelte";

  const bearbyWallet = web3.wallet;

  const shortAddress = $derived(wallet.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-6)}` : "");

  const updateAccount = async () => {
    wallet.address = bearbyWallet.account.base58;
    wallet.connected = bearbyWallet.connected;
    console.log("bearbyWallet change", bearbyWallet, $state.snapshot(wallet));
  };

  const connectBearby = async () => {
    if (!bearbyWallet.installed) return toast.error("Wallet not installed");
    if (!bearbyWallet.enabled) return toast.error("Wallet not enabled");
    if (bearbyWallet.connected) return toast.error(`Wallet already connected<br/>${shortAddress}`);

    try {
      await bearbyWallet.connect();
      updateAccount();
      toast.success(`Wallet ${shortAddress} connected`);
    } catch (error) {
      toast.error("Error connecting to Wallet");
      console.error("Wallet Error:", error);
    }
  };

  const disconnectBearby = async () => {
    if (!wallet.connected) return toast.error("Wallet not connected");

    try {
      await bearbyWallet.disconnect();
      updateAccount();
      toast.success(`Wallet disconnected`);
    } catch (error) {
      toast.error("Error disconnecting to Wallet");
      console.error("Wallet Error:", error);
    }
  };

  let accountSubscription: { unsubscribe: () => void };
  onMount(() => {
    accountSubscription = bearbyWallet.account.subscribe(updateAccount);
  });
  onDestroy(() => {
    accountSubscription?.unsubscribe();
  });
</script>

{#if wallet.connected}
  <div class="flex items-center gap-2">
    <span class="text-sm font-medium text-gray-700">{shortAddress}</span>
    <button onclick={disconnectBearby} class="button-standard"> Disconnect </button>
  </div>
{:else}
  <button onclick={connectBearby} class="button-standard"> Connect </button>
{/if}

<style lang="postcss">
  .button-standard {
    @apply rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600;
  }
</style>
