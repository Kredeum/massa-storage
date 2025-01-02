<script lang="ts">
  let { searchTerm, onsearch } = $props<{
    searchTerm: string;
    onsearch: (value: string) => void;
  }>();

  function clearSearch() {
    searchTerm = "";
    onsearch("");
  }

  function handleInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    onsearch(value);
  }
</script>

<div class="relative">
  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
    🔍
  </span>
  <input
    type="text"
    placeholder="Search files..."
    class="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    bind:value={searchTerm}
    oninput={handleInput}
    aria-label="Search files"
  />
  {#if searchTerm}
    <button
      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      onclick={clearSearch}
      aria-label="Clear search"
    >
      ✕
    </button>
  {/if}
</div>
