<script lang="ts">
  import { onMount } from "svelte";
  import { CID } from "multiformats/cid";

  import { createHelia, type Helia } from "helia";
  import { IDBBlockstore } from "blockstore-idb";
  import { IDBDatastore } from "datastore-idb";
  import { SvelteMap } from "svelte/reactivity";

  const blockstore = new IDBBlockstore("helia/blockstore");
  const datastore = new IDBDatastore("helia/datastore");

  let cid = $state("QmPChd2hVbrJ6bfo3WBcTW4iZnpHm8TEzWkLHmLpXhF68A");
  let count: SvelteMap<string, number> = $state(new SvelteMap());
  let countCid = $derived(count.get(cid));

  let helia: Helia;

  const find = async (_cid: string) => {
    if (!helia) return;
    if (count.has(_cid)) return;

    console.log("finding", _cid);

    for await (const provider of helia.routing.findProviders(CID.parse(_cid))) {
      console.log(String(provider.id), provider.multiaddrs);
      count.set(String(_cid), (count.get(_cid) || 0) + 1);
    }

    console.log("found", _cid);
  };

  onMount(async () => {
    await blockstore.open();
    await datastore.open();
    helia = await createHelia({ blockstore, datastore });
    console.info("helia ok");

    find(cid);
  });
</script>

<div class="flex items-center space-x-4 p-5">
  <input id="cidInput" type="text" bind:value={cid} class="w-[600px] rounded-md border border-gray-300 p-2 text-lg focus:border-blue-500 focus:outline-none" />

  <div class="rounded bg-blue-100 px-4 py-2">{countCid || "?"}</div>
</div>

<div class="p-5 text-xl">
  {cid} = 
  {count.get(cid)}
</div>
