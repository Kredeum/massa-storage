<script lang="ts">
  import { Ipfs } from "$lib/runes/ipfs.svelte";
  import { onMount } from "svelte";
  import { getContext } from "svelte";

  import { STATUS_APPROVED, STATUS_PENDING, STATUS_REJECTED, statusLabel } from "@kredeum/massa-storage-common/src/constants";
  import type { CidDataType, StatusType } from "$lib/ts/types";
  import Connect from "$lib/components/Connect.svelte";
  import { SvelteMap } from "svelte/reactivity";
  import { createKuboClient } from "$lib/ts/kubo";
  import type { CID } from "multiformats";

  const ipfs = new Ipfs();
  let kubo: ReturnType<typeof createKuboClient>;

  let loaded = $state<boolean>(false);

  let cidsOnchain = $state<SvelteMap<string, CidDataType>>(new SvelteMap());
  let cidsPinned = $state<Array<string>>([]);

  const refresh = async () => {
    if (!ipfs.ready) return;

    kubo = await createKuboClient();

    cidsOnchain = await ipfs.cidsGet();

    cidsPinned = await kubo.pins();

    loaded = true;
  };

  $effect(() => {
    refresh();
  });

  $inspect("PAGE cids", ipfs.cids);
</script>

<h1 class="mb-6 text-2xl">
  <Connect client={ipfs} />
</h1>

<div class="flex flex-row justify-center">
  <div class="w-[600px]">
    <div class="mt-4">
      <p class="mb-2 text-xl font-bold">Collections CIDs</p>
      {#if loaded}
        {#if cidsOnchain.size > 0}
          {#each [...cidsOnchain.entries()] as [_cid, _value]}
            <p class="cid-status {statusLabel(_value.status)}">
              {#if cidsPinned.includes(_cid)}
                <span class="bg-blue-100 p-1">{_cid}</span>
              {:else}
                {_cid}
              {/if}
            </p>
          {/each}
        {:else}
          <p>No one found!</p>
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
    margin-bottom: 0.5em;
    background-color: #fafafa;
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
</style>
