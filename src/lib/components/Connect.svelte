<script lang="ts">
  import { onDestroy, onMount, setContext } from "svelte";
  import { toast } from "svelte-hot-french-toast";
  import { web3 } from "@hicaru/bearby.js";

  import { wallet } from "$lib/runes/state.svelte";

  const bearbyWallet = web3.wallet;

  const shortAddress = $derived(wallet.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-6)}` : "");

  const getBalance = async () => {
    if (!wallet.connected) return;
    if (!wallet.address) return;

    try {
      const data = await web3.massa.getAddresses(wallet.address);
      return data.result?.[0]?.final_balance;
    } catch (error) {
      console.error("Error getting native balance:", error);
      toast.error("Error getting native balance");
    }
  };

  const refreshBalance = async () => {
    const bal = await getBalance();
    if (bal !== undefined) {
      wallet.balance = bal;
      toast.success("Balance refreshed");
    }
  };

  const updateAccount = async () => {
    wallet.address = bearbyWallet.account.base58;
    wallet.connected = bearbyWallet.connected;
    wallet.balance = await getBalance();
    console.log("bearbyWallet change", bearbyWallet, $state.snapshot(wallet));
  };

  const connectBearby = async () => {
    if (!bearbyWallet.installed) return toast.error("Wallet not installed");
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
    <div class="flex flex-col text-sm">
      <span class="font-medium text-gray-700">{shortAddress}</span>
      <span class="font-medium text-gray-700">{wallet.balance} nMAS</span>
    </div>
    <button onclick={refreshBalance} class="button-standard" title="Refresh Balance">↻</button>
    <button onclick={disconnectBearby} class="button-standard">Disconnect</button>
  </div>
{:else}
  <button onclick={connectBearby} class="button-standard">Connect</button>
{/if}
