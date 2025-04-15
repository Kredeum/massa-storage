<script lang="ts">
  import { getWallets, type Wallet, type WalletName } from "@massalabs/wallet-provider";
  import toast from "svelte-hot-french-toast";

  // Props to bind the selection outwards
  let {
    walletName = $bindable(), // Make bindable
    disabled = false, // Add disabled prop
    id = "wallet-select" // Add id prop with default
  } = $props<{
    walletName?: WalletName | undefined;
    disabled?: boolean;
    id?: string;
  }>();

  let wallets = $state<Wallet[]>([]);
  let isLoading = $state<boolean>(true);
  let error = $state<string | null>(null);

  $effect(() => {
    async function loadWallets() {
      isLoading = true;
      error = null;
      try {
        wallets = await getWallets();
      } catch (e) {
        console.error("WalletSelect: Failed to load wallets:", e);
        error = "Failed to load wallets.";
        wallets = [];
      } finally {
        isLoading = false;
        // Show toast notification here after loading is complete
        if (!error && wallets.length === 0) {
          toast.error("No wallets found.\nInstall MassaStation, Bearby, or Metamask Snap.");
        }
      }
    }
    loadWallets();
  });
</script>

{#if isLoading}
  <span>Loading...</span>
{:else if error}
  <span class="text-xs text-red-500">{error}</span>
{:else if wallets.length === 0}
  <span class="text-xs">No wallets.</span>
{:else if wallets.length === 1}
  <!-- Display wallet name directly if only one is available -->
  {wallets[0].name()}
{:else}
  <!-- Show select dropdown if multiple wallets are available -->
  <select bind:value={walletName} class="select-standard text-sm" {disabled} {id}>
    {#each wallets as wallet}
      <option value={wallet.name()}>{wallet.name()}</option>
    {/each}
  </select>
{/if}
