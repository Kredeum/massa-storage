<script lang="ts">
  import { Trash2 } from "lucide-svelte";
  import type { ModeratorProfile, ModeratorAddress } from "$lib/types/profile";
  import { toastStore } from "$lib/stores/toast";
  import { shortenString } from "$lib/ts/utils";

  interface Props {
    moderators?: ModeratorProfile[];
  }

  let { moderators = $bindable([]) }: Props = $props();

  let newModeratorAddress: ModeratorAddress | "" = $state("");

  function validateAddress(address: string): boolean {
    // Accept addresses starting with AU and having the correct length (53 characters total)
    const regex = /^AU[\dA-Za-z]{51}$/;
    return regex.test(address);
  }

  function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString();
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();

    if (!validateAddress(newModeratorAddress)) {
      toastStore.error("Please enter a valid blockchain address");
      return;
    }

    if (moderators.some((mod) => mod.address === newModeratorAddress)) {
      toastStore.error("This address is already a moderator");
      return;
    }

    try {
      moderators = [
        ...moderators,
        {
          address: newModeratorAddress as ModeratorAddress,
          addedAt: Date.now(),
          active: true
        }
      ];
      newModeratorAddress = "";
      toastStore.success("Moderator added successfully!");
    } catch (err) {
      console.error("Failed to add moderator:", err);
      toastStore.error("Failed to add moderator");
    }
  }

  async function removeModerator(address: ModeratorAddress) {
    try {
      moderators = moderators.filter((mod) => mod.address !== address);
      toastStore.success("Moderator removed successfully!");
    } catch (err) {
      console.error("Failed to remove moderator:", err);
      toastStore.error("Failed to remove moderator");
    }
  }
</script>

<div class="space-y-8">
  <!-- Form Section -->
  <div class="mx-auto rounded-lg bg-white p-6 shadow-lg">
    <h2 class="mb-4 text-xl font-semibold text-gray-700">Add New Moderator</h2>
    <form onsubmit={handleSubmit} class="flex gap-4">
      <input
        type="text"
        bind:value={newModeratorAddress}
        placeholder="Enter blockchain address (AU...)"
        class="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Blockchain Address Input"
      />
      <button type="submit" class="button-standard"> Add Moderator </button>
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
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date Added</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
            <th class="w-20 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          {#each moderators as moderator (moderator.address)}
            <tr class="hover:bg-gray-50">
              <td class="whitespace-nowrap px-6 py-4 font-mono text-sm text-gray-900">
                {shortenString(moderator.address)}
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {formatDate(moderator.addedAt)}
              </td>
              <td class="whitespace-nowrap px-6 py-4">
                <span class="inline-flex rounded-full px-2 text-xs font-semibold leading-5 {moderator.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                  {moderator.active ? "Active" : "Inactive"}
                </span>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-center">
                <button onclick={() => removeModerator(moderator.address)} class="text-red-600 transition duration-200 hover:text-red-900" aria-label="Delete moderator">
                  <Trash2 class="h-5 w-5" />
                </button>
              </td>
            </tr>
          {/each}
          {#if moderators.length === 0}
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
