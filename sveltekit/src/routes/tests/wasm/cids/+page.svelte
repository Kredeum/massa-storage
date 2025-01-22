<script lang="ts">
  import { Ipfs } from "$lib/runes/ipfs.svelte";
  import { onMount } from "svelte";
  import { getContext } from "svelte";

  const ipfs: Ipfs = getContext("ipfs");
  let cid = $state<string>("");

  let cidHas = $state<boolean>(false);

  const refresh = async () => {
    await ipfs?.cidsGet();
    const _cidHas = await ipfs?.cidHas(cid);
    if (_cidHas !== undefined) cidHas = _cidHas;
  };

  onMount(refresh);
</script>

<div class="flex flex-col items-center justify-center">
  <!-- <Connect client={ipfs} /> -->

  <div class="w-[800px]">
    <div class="mt-4">
      <pre>{JSON.stringify(ipfs?.cids, null, 2)}</pre>
    </div>

    <div class="mt-4">
      <input type="text" bind:value={cid} placeholder="Enter cid address" class="w-full rounded border p-3 text-lg" />
    </div>
    Is cid {cidHas}

    <div class="mt-4 flex flex-col items-center gap-2">
      <div class="flex gap-2">
        <button onclick={() => ipfs?.cidAdd(cid)} class="button-standard"> Add cid </button>
        <button onclick={() => ipfs?.cidDelete(cid)} class="button-standard"> Delete cid </button>
        <button onclick={refresh} class="button-standard"> Refresh </button>
      </div>
    </div>
  </div>
</div>
