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
			if (!('bearby' in globalThis.window)) return;

			const bearby = window.bearby;
			if (!bearby?.wallet?.account) {
				toast.push('Bearby wallet not found');
				return;
			}

			account = {
				address: bearby.wallet.account.address
			};
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
		on:click={initProvider}
		class="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
	>
		Connect
	</button>
{/if}
