<script lang="ts">
  let { searchTerm = $bindable(), onSearch } = $props<{
    searchTerm: string;
    onSearch: (term: string) => void;
  }>();

  function clearSearch() {
    searchTerm = "";
    onSearch("");
  }

  function handleInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    onSearch(value);
  }
</script>

<div class="relative">
  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"> 🔍 </span>
  <input type="text" placeholder="Search files..." class="w-full rounded-lg border py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500" value={searchTerm} oninput={handleInput} />
  {#if searchTerm}
    <button class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onclick={clearSearch}> ✕ </button>
  {/if}
</div>
