<script lang="ts">
  import { onMount } from "svelte";
  import { createKuboClient } from "$lib/ts/kubo";

  const test = "Bonjour";
  const kubo = createKuboClient();

  onMount(async () => {
    const cid = await kubo.addAndPin(test);

    const cids = await kubo.pins();
  });
</script>

view logs in console...
