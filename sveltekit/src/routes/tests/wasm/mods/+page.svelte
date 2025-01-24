<script lang="ts">
  import { Ipfs } from "$lib/runes/ipfs.svelte";
  import { onMount } from "svelte";
  import { getContext } from "svelte";

  const ipfs: Ipfs = getContext("ipfs");

  let mod = $state<string>("");

  // let moderatorHas = $state<boolean>(false);

  const refresh = async () => {
    await ipfs?.moderatorsGet();
    // const _modHas = await ipfs?.moderatorHas(mod);
    // if (_modHas !== undefined) moderatorHas = _modHas;
  };

  onMount(refresh);
</script>

<div class="flex flex-col items-center justify-center">
  <!-- <Connect client={ipfs} /> -->

  <div class="w-[800px]">
    <div class="mt-4">
      <pre>{JSON.stringify(ipfs?.mods, null, 2)}</pre>
    </div>

    <div class="mt-4">
      <input type="text" bind:value={mod} placeholder="Enter mod address" class="w-full rounded border p-3 text-lg" />
    </div>
    <!-- Is mod {moderatorHas} -->

    <div class="mt-4 flex flex-col items-center gap-2">
      <div class="flex gap-2">
        <button onclick={() => ipfs?.moderatorAdd(mod)} class="button-standard"> Add mod </button>
        <button onclick={() => ipfs?.moderatorDelete(mod)} class="button-standard"> Delete mod </button>
        <button onclick={refresh} class="button-standard"> Refresh </button>
      </div>
    </div>
  </div>
</div>
