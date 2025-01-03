<script lang="ts">
  import { toast } from "svelte-hot-french-toast";

  import type { Provider } from "@massalabs/massa-web3";
  import { getWallets, type Wallet } from "@massalabs/wallet-provider";

  import { account } from "$lib/runes/account.svelte";
  import { onMount } from "svelte";

  let wallet = $state<Wallet>();
  let provider = $state<Provider>();

  const shortAddress = $derived(account.address ? `${account.address.slice(0, 6)}...${account.address.slice(-6)}` : "");

  const init = async () => {
    const wallets: Wallet[] = await getWallets();
    if (wallets.length === 0) return toast.error("No Wallet found");
    wallet = wallets[0];

    const accounts: Provider[] = await wallet.accounts();
    if (accounts.length === 0) return toast.error("No Account found in Wallet");
    provider = accounts[0];
  };

  const getBalance = async (): Promise<bigint | undefined> => {
    if (!provider) return;

    try {
      return await provider.balance(true);
    } catch (error) {
      console.error("Error getting native balance:", error);
      toast.error("Error getting native balance");
    }
  };

  const refreshBalance = async () => {
    const bal = await getBalance();
    if (bal !== undefined) {
      account.balance = bal;
      toast.success("Balance refreshed");
    }
  };

  const updateWallet = async () => {
    if (!wallet) return toast.error("Wallet not installed");
    if (!provider) return toast.error("Provider not found");

    account.address = provider.address;
    account.connected = wallet.connected();
    account.balance = await getBalance();
    console.log("account change", wallet, $state.snapshot(account));
  };

  const connect = async () => {
    if (!wallet) return toast.error("Wallet not installed");
    if (account.connected) return toast.error(`Wallet already connected`);

    try {
      await wallet.connect();
      updateWallet();
      toast.success(`Wallet ${shortAddress} connected`);
    } catch (error) {
      toast.error("Error connecting to Wallet");
      console.error("Wallet Error:", error);
    }
  };

  const disconnect = async () => {
    if (!wallet) return toast.error("Wallet not installed");
    if (!account.connected) return toast.error("Wallet not connected");

    try {
      await wallet.disconnect();
      updateWallet();
      toast.success(`Wallet disconnected`);
    } catch (error) {
      toast.error("Error disconnecting to Wallet");
      console.error("Wallet Error:", error);
    }
  };

  onMount(init);
</script>

{#if account.connected}
  <div class="flex items-center gap-2">
    <div class="flex flex-col text-sm">
      <span class="font-medium text-gray-700">{shortAddress}</span>
      <span class="font-medium text-gray-700">{account.balance} nMAS</span>
    </div>
    <button onclick={refreshBalance} class="button-standard" title="Refresh Balance">↻</button>
    <button onclick={disconnect} class="button-standard">Disconnect</button>
  </div>
{:else}
  <button onclick={connect} class="button-standard">Connect</button>
{/if}
