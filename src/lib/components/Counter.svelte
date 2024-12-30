<!-- Counter.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { toast } from '@zerodevx/svelte-toast';
  import { Args, EventPoller, Provider, getWallets, type Wallet } from '$lib/massa-mock';

  let provider: Provider | undefined;
  let wallet: Wallet | undefined;
  let account: string = '';
  let connected: boolean = false;
  let count: bigint | undefined = BigInt(0);
  let incrementValue: number | '' = '';
  let isPendingInc: boolean = false;
  let events: any[] = [];

  const CONTRACT_ADDRESS: string = "AS12b4pgVgvF9GKL6S8wZ6AEKENeqihZ8Qmxkr5NT4Ho7wYp9D9NT";

  $: shortenedAccount = account ? `${account.slice(0, 6)}...${account.slice(-6)}` : '';

  async function initProvider() {
    try {
      const walletList = await getWallets();
      wallet = walletList[0];

      if (!wallet) {
        toast.push('No wallet found');
        return;
      }

      const accounts = await wallet?.accounts();
      account = accounts[0].address;

      if (accounts.length === 0) {
        toast.push('No accounts found');
        return;
      }

      provider = new Provider();
      connected = true;
      toast.push('Connected successfully!');

    } catch (error) {
      console.error('Error initializing provider:', error);
      toast.push('Failed to initialize provider');
    }
  }

  async function incrementCounter() {
    if (!provider || !incrementValue) return;

    try {
      isPendingInc = true;
      // Simulate increment
      count = count === undefined ? BigInt(incrementValue) : count + BigInt(incrementValue);
      toast.push('Counter incremented!');
    } catch (error) {
      console.error('Error incrementing counter:', error);
      toast.push('Failed to increment counter');
    } finally {
      isPendingInc = false;
      incrementValue = '';
    }
  }

  onMount(() => {
    initProvider();
  });
</script>

<div class="counter-container">
  <div class="wallet-status">
    {#if connected}
      <span data-testid="wallet-status">Connected: {shortenedAccount}</span>
    {:else}
      <button data-testid="connect-wallet" on:click={initProvider}>Connect Wallet</button>
    {/if}
  </div>

  <div class="counter-display">
    <h2 data-testid="counter-value">Current Count: {count ?? 'Loading...'}</h2>
  </div>

  <div class="counter-controls">
    <input
      data-testid="increment-input"
      type="number"
      bind:value={incrementValue}
      placeholder="Enter increment value"
      min="1"
    />
    <button
      data-testid="increment-button"
      on:click={incrementCounter}
      disabled={!connected || isPendingInc || !incrementValue}
    >
      {#if isPendingInc}
        Loading...
      {:else}
        Increment Counter
      {/if}
    </button>
  </div>

  <div class="events-display">
    <h3>Events</h3>
    {#each events as event}
      <div class="event-item">
        {event.data}
      </div>
    {/each}
  </div>
</div>

<style>
  .counter-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
  }

  .wallet-status {
    margin-bottom: 2rem;
    text-align: center;
  }

  .counter-display {
    text-align: center;
    margin-bottom: 2rem;
  }

  .counter-controls {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 2rem;
  }

  input {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  button {
    padding: 0.5rem 1rem;
    background-color: #0070f3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  .events-display {
    margin-top: 2rem;
  }

  .event-item {
    padding: 0.5rem;
    border: 1px solid #eaeaea;
    margin-bottom: 0.5rem;
    border-radius: 4px;
  }
</style>
