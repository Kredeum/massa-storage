<script lang="ts">
  import { Check, X, Pin } from "lucide-svelte";
  export let selectedCount: number;
  export let onApprove: () => void;
  export let onReject: () => void;
  export let onPin: () => void;
</script>

{#if selectedCount > 0}
  <div class="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transform">
    <div class="flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-6 py-3 shadow-xl">
      <span class="text-sm font-medium text-gray-700">{selectedCount} file{selectedCount > 1 ? "s" : ""} selected</span>
      <div class="flex items-center gap-3.5">
        <button class="cursor-pointer text-green-600 hover:text-green-900" onclick={onApprove}>
          <Check size={22} strokeWidth={3} />
        </button>
        <button class="cursor-pointer text-red-600 hover:text-red-900" onclick={onReject}>
          <X size={22} strokeWidth={3} />
        </button>
        <button class="cursor-pointer text-gray-600 hover:text-blue-900" onclick={onPin}>
          <Pin size={22} strokeWidth={3} />
        </button>
      </div>
    </div>
  </div>
{/if}
