<script lang="ts">
  import { getContext } from "svelte";
  import { Check, X, Pin } from "lucide-svelte";
  import type { Ipfs } from "$lib/runes/ipfs.svelte";

  let {
    selectedCount,
    onApprove,
    onReject,
    onPin
  }: {
    selectedCount: number;
    onApprove: () => void;
    onReject: () => void;
    onPin: () => void;
  } = $props();

  const ipfs: Ipfs = getContext("ipfs");

  let isModerator = $state<boolean>();

  const refresh = async (): Promise<void> => {
    if (!ipfs.ready) return;

    isModerator = await ipfs.moderatorHas(ipfs.address);
  };

  $effect(() => {
    refresh();
  });
</script>

{#if selectedCount > 0}
  <div class="flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-4 py-2 shadow-sm">
    <span class="text-sm font-medium text-gray-700">{selectedCount} file{selectedCount > 1 ? "s" : ""}</span>
    <div class="flex items-center gap-2">
      {#if isModerator}
        <button class="cursor-pointer text-green-600 hover:text-green-900" onclick={onApprove}>
          <Check size={22} strokeWidth={3} />
        </button>
        <button class="cursor-pointer text-red-600 hover:text-red-900" onclick={onReject}>
          <X size={22} strokeWidth={3} />
        </button>
      {/if}
      <button class="cursor-pointer text-gray-600 hover:text-blue-900" onclick={onPin}>
        <Pin size={22} strokeWidth={3} />
      </button>
    </div>
  </div>
{/if}
