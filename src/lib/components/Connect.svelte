<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from '@zerodevx/svelte-toast';

	let account: { address: string } | undefined = $state();
	let connected: boolean = $state(false);

	const shortenedAccount = $derived(
		account?.address ? `${account.address.slice(0, 6)}...${account.address.slice(-6)}` : ''
	);

	const initProvider = async () => {
		try {
			let wallets;

			if (!('bearby' in globalThis.window)) return;

			wallets = await window.massa.wallet.account;

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
			// client = await wallet.getClient();
			connected = true;
		} catch (error) {
			toast.push('Error connecting to wallet');
			console.error('Error:', error);
		}
	};

	onMount(initProvider);
</script>

{#if connected}
	<div class="flex items-center gap-2">
		<span class="text-sm font-medium text-gray-700">{shortenedAccount}</span>
		<div class="h-2 w-2 rounded-full bg-green-500"></div>
	</div>
{:else}
	<button
		onclick={initProvider}
		class="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
	>
		Connect Wallet
	</button>
{/if}
