<script lang="ts">
  import ModeratorList from "$lib/components/moderators/ModeratorList.svelte";
  import { getContext, onMount } from "svelte";
  import type { Ipfs } from "$lib/runes/ipfs.svelte";
  import { goto } from "$app/navigation";
  import { toast } from "svelte-hot-french-toast";

  const ipfs: Ipfs = getContext("ipfs");
  let isOwner = $state(false);

  async function checkOwner() {
    if (!ipfs.ready) return;
    if (!ipfs.address) return;
    try {
      const result = await ipfs.isOwner(ipfs.address);
      isOwner = result === true;
      if (!isOwner) {
        toast.error("Access denied: only the contract owner can access this page");
        goto("/app/collections");
      }
    } catch (error) {
      console.error("Error checking owner:", error);
      toast.error("Error checking permissions");
      goto("/app/collections");
    }
  }

  onMount(() => {
    checkOwner();
  });
</script>

{#if isOwner}
  <div class="container mx-auto py-6">
    <div class="mx-auto max-w-7xl">
      <ModeratorList />
    </div>
  </div>
{/if}
