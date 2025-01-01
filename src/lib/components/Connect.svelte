<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from '@zerodevx/svelte-toast';
	import '@hicaru/bearby.js';
	import { initBearby } from '$lib/bearbyInit';

	let account: { address: string } | undefined = $state();
	let connected: boolean = $state(false);
	let bearbyInitialized = $state(false);

	const shortenedAccount = $derived(
		account?.address ? `${account.address.slice(0, 6)}...${account.address.slice(-6)}` : ''
	);

	onMount(async () => {
		try {
			const bearby = await initBearby();
			bearbyInitialized = true;
			if (bearby.wallet.account?.address) {
				account = { address: bearby.wallet.account.address };
				connected = true;
			}
		} catch (error) {
			console.error('Error initializing Bearby:', error);
			toast.push({ msg: 'Error initializing Bearby wallet', theme: { '--toastBackground': '#F56565' } });
		}
	});

	const initProvider = async () => {
		try {
			if (typeof window === 'undefined' || !window.bearby) {
				toast.push({ msg: 'Please install Bearby wallet extension' });
				return;
			}

			if (!bearbyInitialized) {
				toast.push({ msg: 'Bearby wallet not initialized' });
				return;
			}

			const isConnected = await window.bearby.wallet.connect();
			if (!isConnected) {
				toast.push({ msg: 'Failed to connect to Bearby wallet', theme: { '--toastBackground': '#F56565' } });
				return;
			}

			if (!window.bearby.wallet.account?.address) {
				toast.push({ msg: 'No account found after connection', theme: { '--toastBackground': '#F56565' } });
				return;
			}

			account = { address: window.bearby.wallet.account.address };
			connected = true;
			toast.push({ msg: 'Connected successfully', theme: { '--toastBackground': '#48BB78' } });
		} catch (error) {
			console.error('Error connecting to wallet:', error);
			toast.push({ msg: 'Error connecting to wallet', theme: { '--toastBackground': '#F56565' } });
		}
	};

	const disconnect = async () => {
		try {
			if (!bearbyInitialized || !window.bearby?.wallet) {
				return;
			}
			account = undefined;
			connected = false;
			toast.push({ msg: 'Disconnected successfully', theme: { '--toastBackground': '#48BB78' } });
		} catch (error) {
			console.error('Error disconnecting:', error);
			toast.push({ msg: 'Error disconnecting from wallet', theme: { '--toastBackground': '#F56565' } });
		}
	};
</script>

{#if connected}
	<div class="flex items-center gap-2">
		<span class="text-sm font-medium text-gray-700">Connected {shortenedAccount || undefined}</span>
		<div class="h-2 w-2 rounded-full bg-green-500"></div>
		<button
			onclick={disconnect}
			class="ml-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
			title="Disconnect"
			aria-label="Disconnect"
		>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
				<path
					fill-rule="evenodd"
					d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
					clip-rule="evenodd"
				/>
			</svg>
		</button>
	</div>
{:else}
	<button
		onclick={initProvider}
		class="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
	>
		Connect
	</button>
{/if}
