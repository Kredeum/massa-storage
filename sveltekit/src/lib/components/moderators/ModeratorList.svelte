<script lang="ts">
  import { toast } from "svelte-hot-french-toast";
  import { Trash2 } from "lucide-svelte";
  import { getContext, onMount } from "svelte";
  import type { Ipfs } from "$lib/runes/ipfs.svelte";
  import { copyToClipboard } from "$lib/ts/utils";

  const ipfs: Ipfs = getContext("ipfs");

  const refresh = async () => {
    await ipfs?.moderatorsGet();
  };
  onMount(refresh);

  let newModeratorAddress: string = $state("");

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    const loadingToast = toast.loading("Adding moderator...");
    try {
      await ipfs?.moderatorAdd(newModeratorAddress);
      newModeratorAddress = "";
      await refresh();
    } catch (error) {
      console.error("Failed to add moderator:", error);
      toast.error("Failed to add moderator");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const deleteModerator = async (moderator: string) => {
    const loadingToast = toast.loading("Deleting moderator...");
    await ipfs?.moderatorDelete(moderator);
    await refresh();
    toast.dismiss(loadingToast);
  };

  const handleCopyAddress = async (address: string) => {
    await copyToClipboard(address, "Address copied!");
  };
</script>

<div class="space-y-8">
  <!-- Form Section -->
  <div class="mx-auto rounded-lg bg-white p-6 shadow-lg">
    <h2 class="mb-4 text-xl font-semibold text-gray-700">Add New Moderator</h2>
    <form onsubmit={handleSubmit} class="flex gap-4">
      <input
        id="input-moderator-address"
        type="text"
        bind:value={newModeratorAddress}
        placeholder="Enter blockchain address (AU...)"
        class="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Blockchain Address Input"
      />
      <button id="button-moderator-add" type="submit" class="button-standard"> Add Moderator </button>
    </form>
  </div>

  <!-- Table Section -->
  <div class="overflow-hidden rounded-lg bg-white shadow-lg">
    <h2 class="border-b p-6 text-xl font-semibold text-gray-700">Moderators List</h2>
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Address</th>

            <th class="w-20 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          {#each ipfs?.mods as moderator}
            <tr>
              <td class="whitespace-nowrap px-6 py-4">
                <button
                  type="button"
                  class="font-mono text-sm text-gray-900 hover:text-gray-700 focus:outline-none"
                  onclick={() => handleCopyAddress(moderator)}
                  onkeydown={(e) => e.key === "Enter" && handleCopyAddress(moderator)}
                >
                  {moderator}
                </button>
              </td>

              <td class="whitespace-nowrap px-6 py-4 text-center">
                <button onclick={() => deleteModerator(moderator)} class="text-red-600 transition duration-200 hover:text-red-900" aria-label="Delete moderator">
                  <Trash2 class="h-5 w-5" />
                </button>
              </td>
            </tr>
          {/each}
          {#if ipfs?.mods.length === 0}
            <tr>
              <td colspan="4" class="px-6 py-8 text-center text-sm text-gray-500">
                <div class="flex flex-col items-center space-y-2">
                  <span>No moderators added yet</span>
                  <span class="text-xs text-gray-400">Add a moderator using the form above</span>
                </div>
              </td>
            </tr>
          {/if}
        </tbody>
      </table>
    </div>
  </div>
</div>
