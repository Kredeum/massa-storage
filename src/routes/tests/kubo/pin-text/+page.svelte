<script lang="ts">
  import { onMount } from "svelte";
  import { createKuboClient } from "$lib/ts/kubo";

  const test = "Bonjour";

  onMount(async () => {
    const kubo = await createKuboClient();

    console.log(test);
    const cid = await kubo.addAndPin(test);
    console.log(cid.toString());
    console.log(await kubo.cat(cid));

    const cids = await kubo.pins();
    console.log(cids.map((cid) => cid.toString()));
  });
</script>

view logs in console...