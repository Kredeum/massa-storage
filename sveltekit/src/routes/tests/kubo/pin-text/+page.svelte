<script lang="ts">
  import { onMount } from "svelte";
  import { createKuboClient } from "$lib/ts/kubo";

  const test = "Bonjour";

  onMount(async () => {
    const kubo = await createKuboClient();

    const cid = await kubo.addAndPin(test);

    const cids = await kubo.pins();
  });
</script>

view logs in console...
