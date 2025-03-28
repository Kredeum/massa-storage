<script lang="ts">
  import { onDestroy } from "svelte";
  import { shortenString } from "$lib/ts/utils";

  let { text, label } = $props<{
    text: string;
    label?: string;
  }>();

  let copied = $state(false);
  let timeoutId: number;

  async function handleCopy(e: MouseEvent) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        copied = false;
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }

  onDestroy(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
</script>

<div class="relative">
  <button class="group text-gray-500 hover:text-gray-700 focus:outline-none" onclick={handleCopy} aria-label={label ? `Copy ${label}` : `Copy ${text}`}>
    {shortenString(text)}
    <span
      class="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-700 px-3 py-2 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100"
    >
      {#if copied}
        Copied!
      {:else}
        {text}
      {/if}
    </span>
  </button>
</div>
