<!-- Counter.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from '@zerodevx/svelte-toast';
	import type { Client } from '@massalabs/massa-web3';
	import type { IAccount } from '@massalabs/wallet-provider';

	let client: Client | undefined;
	let account: IAccount | undefined;
	let count: bigint | undefined = BigInt(0);
	let isPendingInc: boolean = false;
	interface Event {
		data: string;
	}
	let events: Event[] = [];

	const CONTRACT_ADDRESS: string = 'AS12b4pgVgvF9GKL6S8wZ6AEKENeqihZ8Qmxkr5NT4Ho7wYp9D9NT';

	async function getCount() {
		if (!client) return;

		try {
			const args = [];
			const result = await client.smartContracts().readSmartContract({
				targetAddress: CONTRACT_ADDRESS,
				targetFunction: 'getCounter',
				parameter: args,
				maxGas: BigInt(1000000)
			});

			count = BigInt(result.toString());
		} catch (error) {
			console.error('Error getting count:', error);
			toast.push('Error getting count');
		}
	}

	async function increment() {
		if (!client || isPendingInc) return;

		try {
			isPendingInc = true;
			const args = ['1']; // Always increment by 1

			await client.smartContracts().callSmartContract({
				targetAddress: CONTRACT_ADDRESS,
				functionName: 'increment',
				parameter: args,
				maxGas: BigInt(1000000),
				coins: BigInt(0),
				fee: BigInt(0)
			});

			toast.push('Increment transaction sent');
			await new Promise((resolve) => setTimeout(resolve, 2000));
			await getCount();
		} catch (error) {
			console.error('Error incrementing:', error);
			toast.push('Error incrementing');
		} finally {
			isPendingInc = false;
		}
	}

	onMount(() => {
		const interval = setInterval(getCount, 5000);
		return () => clearInterval(interval);
	});
</script>

<main class="mx-auto max-w-2xl p-8">
	<div class="flex flex-col items-center space-y-8">
		<button
			on:click={increment}
			disabled={!client || isPendingInc}
			class="flex flex-col items-center rounded-lg bg-blue-500 px-8 py-4 font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
		>
			<span class="text-4xl font-bold">{count?.toString() ?? '...'}</span>
			<span class="mt-2 text-xl font-medium">
				{#if isPendingInc}
					Incrementing...
				{:else}
					Increment
				{/if}
			</span>
		</button>

		{#if events.length > 0}
			<div class="w-full">
				<h2 class="mb-4 text-xl font-semibold">Events:</h2>
				<ul class="space-y-2">
					{#each events as event}
						<li class="rounded-lg bg-gray-100 p-4">{event.data}</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
</main>
