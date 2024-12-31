<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from '@zerodevx/svelte-toast';
	import '@hicaru/bearby.js';

	let account: { address: string } | undefined = $state();
	let connected: boolean = $state(false);

	const shortenedAccount = $derived(
		account?.address ? `${account.address.slice(0, 6)}...${account.address.slice(-6)}` : ''
	);

	const initProvider = async () => {
		try {
			console.log('Button clicked');
			console.log('Window bearby:', window.bearby);

			if (!window.bearby?.wallet) {
				toast.push('Bearby wallet not found');
				return;
			}

			const isConnected = await window.bearby.wallet.connect();
			if (!isConnected) {
				toast.push('Failed to connect to Bearby wallet');
				return;
			}

			account = {
				address: window.bearby.wallet.account.address
			};
			connected = true;
			console.log('Connected successfully:', account);
		} catch (error) {
			toast.push('Error connecting to wallet');
			console.error('Error:', error);
		}
	};

	onMount(() => {
		// Only check if wallet exists, don't auto-connect
		if (window.bearby?.wallet) {
			console.log('Bearby wallet found');
		} else {
			console.log('Bearby wallet not found');
		}
	});
</script>

{#if connected}
	<div class="flex items-center gap-2">
		<span class="text-sm font-medium text-gray-700">Connected {shortenedAccount}</span>
		<div class="h-2 w-2 rounded-full bg-green-500"></div>
	</div>
{:else}
	<button
		onclick={initProvider}
		class="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
	>
		Connect
	</button>
{/if}
