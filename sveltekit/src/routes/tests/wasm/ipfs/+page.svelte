<script lang="ts">
  import { Ipfs } from "$lib/runes/ipfs.svelte";
  import { onMount } from "svelte";
  import { getContext } from "svelte";

  const ipfs: Ipfs = getContext("ipfs");
  let moderator = $state<string>("");

  let isModerator = $state<boolean>(false);

  const refresh = async () => {
    await ipfs?.getModerators();
    const mod = await ipfs?.isModerator(moderator);
    if (mod !== undefined) isModerator = mod;
  };

  onMount(refresh);
</script>

<div class="flex flex-col items-center justify-center">
  <!-- <Connect client={ipfs} /> -->

  <div class="w-[800px]">
    <div class="mt-4">
      <pre>{JSON.stringify(ipfs?.moderators, null, 2)}</pre>
    </div>

    <div class="mt-4">
      <input type="text" bind:value={moderator} placeholder="Enter moderator address" class="w-full rounded border p-3 text-lg" />
    </div>
    Is moderator {isModerator}

    <div class="mt-4 flex flex-col items-center gap-2">
      <div class="flex gap-2">
        <button onclick={() => ipfs?.addModerator(moderator)} class="button-standard"> Add Moderator </button>
        <button onclick={() => ipfs?.deleteModerator(moderator)} class="button-standard"> Delete Moderator </button>
        <button onclick={refresh} class="button-standard"> Refresh </button>
      </div>
    </div>
  </div>
</div>
