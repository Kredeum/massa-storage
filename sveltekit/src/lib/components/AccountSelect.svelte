<script lang="ts">
  import type { Provider } from "@massalabs/massa-web3";
  import { type Wallet } from "@massalabs/wallet-provider";
  import { shortenString } from "$lib/ts/utils";

  // Helper function to display account name or shortened address
  function accountDisplay(account: Provider): string {
    if (account.accountName && account.accountName !== account.address) {
      return account.accountName;
    } else {
      return shortenString(account.address);
    }
  }

  // Props
  let {
    wallet,
    accountIndex = $bindable(), // Bindable index prop
    disabled = false, // Added disabled prop
    id = "account-select" // Add id prop
  } = $props<{
    wallet: Wallet | undefined;
    accountIndex?: number;
    disabled?: boolean;
    id?: string;
  }>();

  let accounts = $state<Provider[]>([]);
  let isLoading = $state<boolean>(false);
  let error = $state<string | null>(null);

  $effect(() => {
    // Reset component state if wallet becomes undefined
    if (!wallet) {
      accounts = [];
      isLoading = false;
      error = null;
      accountIndex = -1; // Indicate no selection possible
      return;
    }

    // Load accounts when the wallet prop changes and is valid
    async function loadAccounts() {
      accounts = [];
      accountIndex = -1; // Indicate no selection possible
      error = null;
      isLoading = true;
      try {
        accounts = await wallet.accounts(); // This returns WalletProviderAccount[]
        if (accounts.length > 0) {
          accountIndex = 0; // Auto-select index 0 if accounts exist
        } else {
          accountIndex = -1; // Indicate no selection possible
        }
      } catch (e) {
        console.error("AccountSelect: Failed to load accounts", e);
        error = "Failed to load accounts.";
        accounts = [];
      } finally {
        isLoading = false;
      }
    }

    loadAccounts();
  });
</script>

{#if !wallet}
  <!-- Render nothing or a placeholder if no wallet is selected/provided -->
{:else if isLoading}
  <select class="select-standard text-sm" disabled>
    <option>Loading...</option>
  </select>
{:else if error}
  <p class="text-xs text-red-500">{error}</p>
{:else if accounts.length === 0}
  <p class="text-xs">No accounts found for this wallet.</p>
{:else if accounts.length === 1}
  <!-- Display account info directly if only one is available -->
  <span class="text-sm font-medium">{accountDisplay(accounts[0])}</span>
{:else}
  <!-- Show select dropdown if multiple accounts are available -->
  <select class="select-standard text-sm" bind:value={accountIndex} disabled={disabled || isLoading} {id}>
    {#each accounts as account, index}
      <option value={index}>{accountDisplay(account)}</option>
    {/each}
  </select>
{/if}
