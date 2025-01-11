<script lang="ts">
  import { onMount } from "svelte";

  import { CID } from "multiformats/cid";
  import { createHelia, type Helia } from "helia";
  import { strings, type Strings } from "@helia/strings";

  let helia: Helia;
  let s: Strings;

  let data = $state<string>("");
  let cid = $state<CID>();
  let cidInput = $state<string>("");

  // svelte-ignore non_reactive_update
  let dataInput = "Bonjour le monde !";

  let retrievedData = $state<string>("");

  onMount(async () => {
    helia = await createHelia();
    s = strings(helia);
  });

  const handleSubmit = async () => {
    if (!dataInput.trim()) return;

    data = dataInput;

    cid = await s.add(data);
    cidInput = cid.toString();

    dataInput = "";
  };

  const handleRetrieve = async () => {
    if (!cidInput.trim()) return;

    try {
      const parsedCid = CID.parse(cidInput);
      retrievedData = await s.get(parsedCid);
    } catch (error) {
      console.error("Error retrieving data:", error);
      retrievedData = "Error: Could not retrieve data";
    }
  };
</script>

<div class="flex flex-col items-center justify-center space-y-8 p-4">
  <div class="w-full max-w-2xl space-y-4">
    <form onsubmit={handleSubmit}>
      <div class="flex gap-2">
        <input type="text" bind:value={dataInput} placeholder="Enter data to store" class="input" />
        <button type="submit" class="button">Store Data</button>
      </div>
    </form>
  </div>

  <div class="w-full max-w-2xl space-y-4">
    <form onsubmit={handleRetrieve}>
      <div class="flex gap-2">
        <input type="text" bind:value={cidInput} placeholder="Enter CID" class="input" />
        <button type="submit" class="button">Retrieve</button>
      </div>
    </form>
    {#if retrievedData}
      <div class="mt-4 rounded bg-gray-100 p-6">
        <p class="whitespace-pre-wrap text-lg">{retrievedData}</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .input {
    @apply min-w-[400px] flex-1 rounded border p-2;
  }

  .button {
    @apply w-[120px] whitespace-nowrap rounded bg-blue-500 p-2 px-6 text-white hover:bg-blue-600;
  }
</style>
