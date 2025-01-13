<script lang="ts">
  import { Search, X } from "lucide-svelte";

  let { searchTerm = $bindable() } = $props<{
    searchTerm: string;
  }>();

  function clearSearch() {
    searchTerm = "";
  }
</script>

<div class="relative">
  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
    <Search size={18} />
  </span>
  <input 
    type="text" 
    placeholder="Search files..." 
    class="w-full rounded-lg border py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500" 
    bind:value={searchTerm}
  />
  {#if searchTerm}
    <button 
      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" 
      onclick={clearSearch}
    >
      <X size={18} />
    </button>
  {/if}
</div>
