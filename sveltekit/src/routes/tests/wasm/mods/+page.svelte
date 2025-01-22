<script lang="ts">
  import { Ipfs } from "$lib/runes/ipfs.svelte";
  import { onMount } from "svelte";
  import { getContext } from "svelte";

  const ipfs: Ipfs = getContext("ipfs");

  let mod = $state<string>("");

  // let modHas = $state<boolean>(false);

  const refresh = async () => {
    await ipfs?.modsGet();
    // const _modHas = await ipfs?.modHas(mod);
    // if (_modHas !== undefined) modHas = _modHas;
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
    <!-- Is mod {modHas} -->

    <div class="mt-4 flex flex-col items-center gap-2">
      <div class="flex gap-2">
        <button onclick={() => ipfs?.modAdd(mod)} class="button-standard"> Add mod </button>
        <button onclick={() => ipfs?.modDelete(mod)} class="button-standard"> Delete mod </button>
        <button onclick={refresh} class="button-standard"> Refresh </button>
      </div>
    </div>
  </div>
</div>
