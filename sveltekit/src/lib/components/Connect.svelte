<script lang="ts">
  import { Writer } from "$lib/runes/writer.svelte";
  import WalletSelect from "./WalletSelect.svelte";
  import AccountSelect from "./AccountSelect.svelte";

  const { client }: { client: Writer } = $props();

  // Derive the selected wallet object needed by AccountSelect
  let selectedWallet = $derived(client.availableWallets.find((w) => w.name() === client.selectedWalletName));

  async function handleConnectDisconnect() {
    if (client.connected) {
      await client.disconnect();
    } else {
      // Use the selection-based connection method
      await client.connectUsingSelection();
    }
  }
</script>

<div class="flex items-center gap-2 text-sm font-medium text-gray-700">
  <!-- Account Selection (only if a wallet is selected) -->
  {#if client.selectedWalletName}
    <div class="flex flex-col items-center justify-center">
      {#if client.isLoadingAccounts}
        <span class="loading loading-spinner loading-xs ml-2"></span>
      {/if}
      <span>
        {#if client.connected && client.selectedAccountNum >= 0 && selectedWallet}
          <!-- Display account directly when connected -->
          {#await selectedWallet.accounts() then accounts}
            {#if accounts[client.selectedAccountNum]}
              {#if accounts[client.selectedAccountNum].accountName && accounts[client.selectedAccountNum].accountName !== accounts[client.selectedAccountNum].address}
                {accounts[client.selectedAccountNum].accountName}
              {:else}
                {accounts[client.selectedAccountNum].address.substring(0, 6)}...{accounts[client.selectedAccountNum].address.substring(accounts[client.selectedAccountNum].address.length - 4)}
              {/if}
            {/if}
          {/await}
        {:else}
          <!-- Show selection dropdown when not connected -->
          <AccountSelect
            wallet={selectedWallet}
            bind:accountIndex={client.selectedAccountNum}
            disabled={client.isLoadingAccounts || client.isConnecting}
            id="account-select-connect"
          />
        {/if}
      </span>
      <span>{client.balanceToDisplay}</span>
    </div>
    <button id="button-refresh" onclick={() => client.refresh()} class="button-standard" title="Refresh Balance">↻</button>
  {/if}

  <!-- Connect / Disconnect Button -->
  <button
    class="button-standard"
    onclick={handleConnectDisconnect}
    disabled={client.isLoadingWallets || client.isLoadingAccounts || client.isConnecting || (!client.connected && (client.selectedAccountNum < 0 || !client.selectedWalletName))}
  >
    {#if client.isConnecting}
      <span class="loading loading-spinner loading-sm"></span> Connecting...
    {:else if client.isLoadingWallets || client.isLoadingAccounts}
      <span class="loading loading-spinner loading-sm"></span> Loading...
    {:else if client.connected}
      Disconnect
    {:else}
      Connect
    {/if}
  </button>

  <!-- Wallet Selection -->
  {#if client.isLoadingWallets}
    <span class="loading loading-spinner loading-sm"></span> Loading wallets...
  {:else}
    <div class="flex flex-col items-center justify-center">
      <span id="wallet-name">
        {#if client.connected}
          <!-- Display wallet name directly when connected -->
          {client.selectedWalletName}
        {:else}
          <!-- Show selection dropdown when not connected -->
          <WalletSelect bind:walletName={client.selectedWalletName} disabled={client.isLoadingWallets || client.isConnecting} id="wallet-select-connect" />
        {/if}
      </span>
      <span id="network-name">{client.networkName}</span>
    </div>
  {/if}
</div>
