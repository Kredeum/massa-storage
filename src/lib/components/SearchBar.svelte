<script lang="ts">
  import { ICONS } from '$lib/constants';
  export let searchTerm: string;
  export let onSearch: (value: string) => void;

  function clearSearch() {
    searchTerm = "";
    onSearch("");
  }
</script>

<div class="relative">
  <input
    type="text"
    placeholder="Search files..."
    class="w-full px-4 py-2 border rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
    bind:value={searchTerm}
    oninput={(e: Event) => searchTerm = (e.target as HTMLInputElement).value}
    aria-label="Search files"
  />
  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
    🔍
  </span>
  {#if searchTerm?.length > 0}
    <button 
      onclick={clearSearch}
      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer font-bold text-xl"
      aria-label="Clear search"
    >
      ×
    </button>
  {/if}
</div>
