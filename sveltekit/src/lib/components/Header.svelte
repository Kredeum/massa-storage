<!-- Header.svelte -->
<script lang="ts">
  import { base } from "$app/paths";
  import logoMassa from "$lib/assets/logoMassa.svg";
  import Connect from "$lib/components/Connect.svelte";
  import type { Ipfs } from "$lib/runes/ipfs.svelte";

  let { client }: { client: Ipfs } = $props();

  let isOwner = $state<boolean>();

  const refresh = async (): Promise<void> => {
    if (!client.ready) return;

    await client.refresh();

    isOwner = (await client.fetchOwner()) === client.address;
  };
  $effect(() => {
    refresh();
  });
</script>

<header class="flex h-16 w-full items-center border-b border-gray-200 bg-white px-4 shadow-sm">
  <nav class="container mx-auto flex items-center justify-between">
    <div class="flex items-center gap-8">
      <a href="{base}/app/collections" class="flex items-center gap-2 text-lg font-semibold text-gray-900">
        <img src={logoMassa} alt="Massa Logo" class="h-8 w-8" />
        MassaFiles
      </a>
      <a href="{base}/app/collections" class="text-sm text-gray-600 hover:text-gray-900">Collections</a>
      {#if isOwner}
        <a href="{base}/app/moderators" class="text-sm text-gray-600 hover:text-gray-900">Admin</a>
      {/if}
      <a href="{base}/tests" class="text-sm text-gray-600 hover:text-gray-900">Tests</a>
      <a href="https://github.com/kredeum/massa-storage" target="_blank" rel="noopener noreferrer" class="text-sm text-gray-600 hover:text-gray-900">GitHub</a>
    </div>
    <div class="flex items-center">
      <Connect {client} />
    </div>
  </nav>
</header>

<div class="mb-2 mt-8 text-center text-xl font-light">Store your content on IPFS with the security of Massa Blockchain</div>
