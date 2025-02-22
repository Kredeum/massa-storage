<script lang="ts">
  import { page } from "$app/state";
  import { Account } from "@massalabs/massa-web3";
  import { PrivateKeyProvider, Writer } from "$lib/runes/writer.svelte";
  import Connect from "$lib/components/Connect.svelte";

  const newClient = async () => {
    const key = page.url.searchParams.get("key") || (await Account.generate()).privateKey.toString();

    const burnerProvider = new PrivateKeyProvider(key);

    return new Writer(burnerProvider);
  };
</script>

<div class="flex h-32 flex-col items-center justify-center">
  <div class="p-2">
    {#await newClient()}
      <div class="animate-pulse">Initializing...</div>
    {:then client}
      <Connect {client} />
    {/await}
  </div>
</div>
