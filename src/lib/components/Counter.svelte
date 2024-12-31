<!-- Counter.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from '@zerodevx/svelte-toast';

	let connected: boolean = $state(false);
	const CONTRACT_ADDRESS = 'AS12b4pgVgvF9GKL6S8wZ6AEKENeqihZ8Qmxkr5NT4Ho7wYp9D9NT';

	async function initProvider() {
		try {
			if (!('bearby' in globalThis.window)) {
				toast.push('Bearby wallet not found');
				return;
			}

			const bearby = window.bearby;
			if (!bearby?.wallet?.account) {
				toast.push('Bearby wallet not found');
				return;
			}

			connected = true;
		} catch (error) {
			toast.push('Error connecting to wallet');
			console.error('Error:', error);
		}
	}

	async function increment() {
		if (!connected) {
			toast.push('Please connect your wallet first');
			return;
		}

		try {
			const bearby = window.bearby;
			const result = await bearby.contract.call({
				maxGas: 200000n,
				coins: 0n,
				fee: 0,
				targetAddress: CONTRACT_ADDRESS,
				functionName: 'increment',
				parameter: []
			});

			toast.push('Transaction sent: ' + result);
		} catch (error) {
			toast.push('Error incrementing counter');
			console.error('Error:', error);
		}
	}

	onMount(initProvider);
</script>

<div class="flex flex-col items-center justify-center gap-4">
	{#if connected}
		<button
			on:click={increment}
			class="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
		>
			Increment Counter
		</button>
	{:else}
		<button
			on:click={initProvider}
			class="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
		>
			Connect to use Counter
		</button>
	{/if}
</div>
