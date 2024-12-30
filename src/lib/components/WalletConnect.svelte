<!-- WalletConnect.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from '@zerodevx/svelte-toast';
	import type { Client } from '@massalabs/massa-web3';
	import type { IAccount } from '@massalabs/wallet-provider';

	let client: Client | undefined;
	let account: IAccount | undefined;
	let connected: boolean = false;

	$: shortenedAccount = account?.address
		? `${account.address.slice(0, 6)}...${account.address.slice(-6)}`
		: '';

	async function initProvider() {
		try {
			let wallets;

			// Check if we're in test environment
			if (typeof window !== 'undefined' && window.massa) {
				wallets = await window.massa.wallet.getWallets();
			} else {
				const walletProvider = (await import('@massalabs/wallet-provider')).default;
				wallets = await walletProvider.getWallets();
			}

			const wallet = wallets[0];

			if (!wallet) {
				toast.push('No wallet found');
				return;
			}

			const accounts = await wallet.accounts();
			if (accounts.length === 0) {
				toast.push('No accounts found');
				return;
			}

			account = accounts[0];
			client = await wallet.getClient();
			connected = true;
		} catch (error) {
			toast.push('Error connecting to wallet');
			console.error('Error:', error);
		}
	}

	onMount(() => {
		initProvider();
	});
</script>

{#if connected}
	<div class="flex items-center gap-2">
		<span class="text-sm font-medium text-gray-700">{shortenedAccount}</span>
		<div class="h-2 w-2 rounded-full bg-green-500"></div>
	</div>
{:else}
	<button
		on:click={initProvider}
		class="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
	>
		Connect Wallet
	</button>
{/if}
