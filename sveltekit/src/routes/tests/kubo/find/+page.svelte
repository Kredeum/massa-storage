<script lang="ts">
  import { onMount } from "svelte";
  import { create } from "kubo-rpc-client";

  const cid = "bafybeibivfrgoaqkisqpq77olvzuiw7edzup6bniblnx32s6gf4n6t72iy";
  const kubo = create(new URL("http://localhost:5001"));
  let count = $state(0);

  const refresh = async () => {
    count = 0;
    const peerList = await kubo.routing.findProvs(cid, { numProviders: 10 });
    console.log("refreshing");
    for await (const peer of peerList) {
      console.log("peer", peer.name);
      if (peer.name === "PROVIDER") count++;
    }
    console.log("refreshed");
  };

  onMount(async () => {
    refresh();
  });
</script>

<div class="p-5 text-xl">
  {cid}
</div>

<div class="p-5 text-xl">
  <button class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600" onclick={refresh}>{count}</button>
</div>
