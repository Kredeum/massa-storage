<script lang="ts">
  import { PinataSDK } from "pinata-web3";
  import { Ipfs } from "$lib/runes/ipfs.svelte";
  import Connect from "$lib/components/Connect.svelte";
  import { statusLabel } from "@kredeum/massa-storage-common/src/constants";
  import type { CidDataType } from "$lib/ts/types";
  import { SvelteMap } from "svelte/reactivity";

  const ipfs = new Ipfs();

  const pinata = new PinataSDK({
    pinataJwt: import.meta.env.VITE_PINATA_JWT,
    pinataGateway: import.meta.env.VITE_PINATA_GATEWAY
  });

  const cidOnPinata = "bafkreidztlldgt4bzirn4wbuwmfezhr72dm4lvuolixiha2cdkbjjggioi";
  const cidOffPinata = "bafybeictoj6ava2ho25rhf7empn5hddioegdsipk227leoduednf5vguya";

  let loaded = $state<boolean>(false);
  type CidDataTypePlus = CidDataType & { pinataUrl?: string };
  let cidsOnchain = $state<SvelteMap<string, CidDataTypePlus>>(new SvelteMap());

  const getPinataUrl = (cid: string): string => {
    return `https://${import.meta.env.VITE_PINATA_GATEWAY}/ipfs/${cid}?pinataGatewayToken=${import.meta.env.VITE_PINATA_ACCESS_TOKEN}`;
  };

  const refresh = async () => {
    if (!ipfs.ready) return;

    cidsOnchain = await ipfs.cidsGet();

    for (const [cid, value] of cidsOnchain) {
      value.pinataUrl = getPinataUrl(cid);
    }
    loaded = true;
  };

  $effect(() => {
    refresh();
  });
</script>

<div class="mb-6">
  <h1 class="text-2xl">
    <Connect client={ipfs} />
  </h1>
</div>

<div class="flex flex-col items-center justify-center">
  <div class="mb-5 w-[600px]">
    <h2 class="text-xl font-bold">Logo uploaded from Pinata with the cid: <small class="text-gray-600">{cidOnPinata}</small></h2>
    <img src={getPinataUrl(cidOnPinata)} alt="Kredeum Logo" class="mb-2 max-h-[300px] max-w-full object-contain" />
  </div>
  <div class="mb-5 w-[600px]">
    <h2 class="text-xl font-bold">An image uploaded from outside of Pinata with the cid: <small class="text-gray-600">{cidOffPinata}</small></h2>
    <img src={getPinataUrl(cidOffPinata)} alt="file off Pinata" class="mb-2 max-h-[300px] max-w-full object-contain" />
  </div>
  <div class="w-[600px]">
    <div class="mt-8">
      <p class="mb-4 text-xl font-bold">Collection Cids from outside of Pinata (should be displayed with Pinata Gateway)</p>
      {#if loaded}
        {#if cidsOnchain.size > 0}
          <div class="flex flex-col gap-2">
            {#each [...cidsOnchain.entries()] as [_cid, _value]}
              <a
                href={_value.pinataUrl}
                target="_blank"
                rel="noopener noreferrer"
                class="cid-status
                  {statusLabel(_value.status)}"
              >
                {_cid}
              </a>
            {/each}
          </div>
        {:else}
          <p>None found!</p>
        {/if}
      {:else}
        <p>Loading...</p>
      {/if}
    </div>
  </div>
</div>

<div class="mt-4 flex flex-col items-center gap-2">
  <div class="flex gap-2">
    <button onclick={refresh} class="button-standard"> Refresh </button>
  </div>
</div>

<style>
  .cid-status {
    font-family: monospace;
    font-size: 1.2em;
    padding: 0.5em;
    background-color: #fafafa;
    cursor: pointer;
    width: 100%;
    @apply rounded-md;
  }
  .cid-status.Approved {
    @apply text-green-600;
  }
  .cid-status.Rejected {
    @apply text-red-600;
  }
  .cid-status.Pending {
    @apply text-yellow-600;
  }
  .cid-status:hover {
    @apply bg-blue-100;
  }
</style>
