<script lang="ts">
  import { Ipfs } from "$lib/runes/ipfs.svelte";
  import { onMount } from "svelte";
  import { getContext } from "svelte";

  import { statusLabel } from "@kredeum/massa-storage-common/src/constants";
  import type { StatusType } from "$lib/ts/types";

  const ipfs: Ipfs = getContext("ipfs");

  let cid = $state<string>("");

  const refresh = async () => {
    await ipfs.cidsGet();

    console.log("cids", JSON.stringify(ipfs.cids.keys(), null, 2), JSON.stringify(ipfs.cids.values(), null, 2));
  };

  $inspect("PAGE cids", ipfs.cids, ipfs.cids.keys(), ipfs.cids.values());
  onMount(() => {
    setTimeout(() => {
      refresh();
    }, 1000);
  });
</script>

<div class="flex flex-col items-center justify-center">
  <div class="w-[800px]">
    <div class="mt-4">
      {#each [...ipfs.cids.entries()] as [_cid, _value]}
        <p>{_cid}: {statusLabel(_value as StatusType)}</p>
        <button onclick={() => ipfs.cidDelete(_cid)} class="button-standard"> Delete cid </button>
        <button onclick={() => ipfs.cidValidate(_cid)} class="button-standard"> Validate cid </button>
        <button onclick={() => ipfs.cidReject(_cid)} class="button-standard"> Reject cid </button>
      {/each}
    </div>

    <div class="mt-4">
      <input type="text" bind:value={cid} placeholder="Enter cid address" class="w-full rounded border p-3 text-lg" />
    </div>

    <div class="mt-4 flex flex-col items-center gap-2">
      <div class="flex gap-2">
        <button onclick={() => ipfs.cidAdd(cid)} class="button-standard"> Add cid </button>
        <button onclick={refresh} class="button-standard"> Refresh </button>
      </div>
    </div>
  </div>
</div>
