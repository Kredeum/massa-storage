<script lang="ts">
  // NOT WORKING :-(

  import { onMount } from "svelte";
  import { heliaWithRemotePins } from "@helia/remote-pinning";
  import { CID } from "multiformats";

  import { createHelia, type Helia } from "helia";
  import { strings, type Strings } from "@helia/strings";

  import all from "it-all";
  import drain from "it-drain";

  let helia: Helia;
  let s: Strings;

  let dataInput = $state<string>("");
  let cidInput = $state<string>("");
  let dataRetrieved = $state<string>("");
  let pinStatus = $state<string>("");

  const PINNING_ENDPOINT = "http://127.0.0.1:5005";
  const PINNING_TOKEN = "1";

  onMount(async () => {
    helia = heliaWithRemotePins(await createHelia(), {
      endpointUrl: PINNING_ENDPOINT,
      apiKey: PINNING_TOKEN
    });
    // await helia.start();
    s = strings(helia);
  });

  const dataHandle = async () => {
    if (!dataInput?.trim()) return;

    try {
      // add data
      const cid = await s.add(dataInput);
      cidInput = cid.toString();
      pinStatus = cidInput;
      pinStatus += "\nData added...";

      // pin data
      await drain(helia.pins.add(cid));
      pinStatus += " and pinned";
    } catch (error) {
      console.error("Error:", error);
      pinStatus = `Error`;
    }
  };
</script>

<div class="flex flex-col items-center justify-center space-y-8 p-4">
  <div class="w-full max-w-3xl space-y-4">
    <form onsubmit={dataHandle}>
      <div class="flex gap-2">
        <input type="text" bind:value={dataInput} placeholder="Enter data to store" class="input" />
        <button type="submit" class="button">Submit</button>
      </div>
    </form>

    {#if pinStatus}
      <div class="mt-4 rounded bg-blue-100 p-4">
        <p class="whitespace-pre-wrap text-blue-800">{pinStatus}</p>
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
