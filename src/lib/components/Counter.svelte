<!-- Counter.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from '@zerodevx/svelte-toast';
	import { Args } from '@massalabs/massa-web3';

	interface SmartContractClient {
		callSmartContract: (params: {
			targetAddress: string;
			functionName: string;
			parameter: Uint8Array;
			maxGas: bigint;
			coins: bigint;
			fee: bigint;
		}) => Promise<{ transactionId: string }>;
		awaitRequiredOperationStatus: (operation: { transactionId: string }) => Promise<void>;
	}

	let client: { smartContracts: () => SmartContractClient } | undefined;
	let connected: boolean = false;

	const CONTRACT_ADDRESS = 'AS12b4pgVgvF9GKL6S8wZ6AEKENeqihZ8Qmxkr5NT4Ho7wYp9D9NT';

	async function initProvider() {
		try {
			let wallets;
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

			client = await wallet.getClient();
			connected = true;
		} catch (error) {
			toast.push('Error connecting to wallet');
			console.error('Error:', error);
		}
	}

	async function increment() {
		if (!client || !connected) {
			toast.push('Please connect your wallet first');
			return;
		}

		try {
			const args = new Args().addU32(1n);
			const operation = await client.smartContracts().callSmartContract({
				targetAddress: CONTRACT_ADDRESS,
				functionName: 'increment',
				parameter: args.serialize(),
				maxGas: BigInt(1000000),
				coins: BigInt(0),
				fee: BigInt(0)
			});

			await client.smartContracts().awaitRequiredOperationStatus(operation);
			toast.push('Counter incremented!');
		} catch (error) {
			toast.push('Error incrementing counter');
			console.error('Error:', error);
		}
	}

	onMount(() => {
		initProvider();
	});
</script>

<div class="flex flex-col items-center gap-4">
	<button
		on:click={increment}
		class="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
		disabled={!connected}
	>
		Increment Counter
	</button>
</div>
