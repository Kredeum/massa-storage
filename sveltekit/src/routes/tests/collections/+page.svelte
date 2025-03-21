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

  type CidDataTypePlus = CidDataType & { isPinned?: boolean; isLocal?: boolean };

  let cidsOnchain = $state<SvelteMap<string, CidDataTypePlus>>(new SvelteMap());
  let cidsPinned = $state<Array<string>>([]);

  const isPinned = (cid: string): boolean => {
    return cidsPinned.includes(cid);
  };

  const isLocal = async (cid: string): Promise<boolean> => {
    console.log("isLocal ~ cid:", cid);
    try {
      const stat = await kubo.stat(`/ipfs/${cid}`, { timeout: 1000, withLocal: true });
      console.log("isLocal ~ size, local:", stat.local, stat.cumulativeSize);
      return Boolean(stat.local);
    } catch (error) {
      return false;
    }
  };

  const refresh = async () => {
    if (!ipfs.ready) return;

    kubo = await createKuboClient();

    cidsOnchain = await ipfs.cidsGet();

    cidsPinned = await kubo.pins();

    for await (const [cid, value] of cidsOnchain) {
      value.isPinned = isPinned(cid);
      value.isLocal = await isLocal(cid);
    }

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
            <p
              class="cid-status
              {statusLabel(_value.status)}
              {_value?.isPinned ? 'Pinned' : ''}
              {_value?.isLocal ? 'Local' : ''}"
            >
              {_cid}
            </p>
          {/each}
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
    margin-bottom: 0.5em;
    background-color: #fafafa;
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
  .cid-status.Pinned {
    @apply bg-blue-100;
  }
  .cid-status.Local {
    @apply border border-blue-800;
  }
</style>
