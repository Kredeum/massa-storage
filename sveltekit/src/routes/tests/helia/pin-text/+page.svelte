<script lang="ts">
  import { onMount } from "svelte";
  import { CID } from "multiformats/cid";

  import { createHelia, type Helia } from "helia";
  import { strings, type Strings } from "@helia/strings";

  import { IDBBlockstore } from "blockstore-idb";
  import { IDBDatastore } from "datastore-idb";

  import all from "it-all";
  import drain from "it-drain";

  // blocks storage inside browser with indexedDB
  const blockstore = new IDBBlockstore("helia/blockstore");
  const datastore = new IDBDatastore("helia/datastore");

  let helia: Helia;
  let s: Strings;

  let dataInput = $state<string>("");
  let cidInput = $state<string>("");
  let dataRetrieved = $state<string>("");

  onMount(async () => {
    await blockstore.open();
    await datastore.open();
    helia = await createHelia({ blockstore, datastore });
    s = strings(helia);
  });

  const dataHandle = async (data?: string) => {
    if (!data?.trim()) return;

    // add data
    const cid = await s.add(data);

    // pin data
    await drain(helia.pins.add(cid));

    const pins = await all(helia.pins.ls());

    // string cid
    cidInput = cid.toString();
  };
  $effect(() => {
    dataHandle(dataInput);
  });

  const dataRetreive = async () => {
    if (!cidInput.trim()) return;

    try {
      const parsedCid = CID.parse(cidInput);
      dataRetrieved = await s.get(parsedCid);
    } catch (error) {
      console.error("Error retrieving data:", error);
      dataRetrieved = "Error: Could not retrieve data";
    }
  };
</script>

<div class="flex flex-col items-center justify-center space-y-8 p-4">
  <div class="w-full max-w-3xl space-y-4">
    <div class="flex gap-2">
      <input type="text" bind:value={dataInput} placeholder="Enter data to store" class="input" />
    </div>

    <form onsubmit={dataRetreive}>
      <div class="flex gap-2">
        <input type="text" bind:value={cidInput} placeholder="Enter CID" class="input" />
        <button type="submit" class="button">Retrieve</button>
      </div>
    </form>
    {#if dataRetrieved}
      <div class="mt-4 rounded bg-gray-100 p-6">
        <p class="whitespace-pre-wrap text-lg">{dataRetrieved}</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .input {
    @apply min-w-[400px] flex-1 rounded border p-2;
  }

  .button {
    @apply w-[140px] whitespace-nowrap rounded bg-blue-500 p-2 px-6 text-white hover:bg-blue-600;
  }
</style>
