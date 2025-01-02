<script lang="ts">
  import { ICONS } from '$lib/constants';
  export let searchTerm: string;
</script>

<div class="relative">
  <input
    type="text"
    placeholder="Search files..."
    class="w-full px-4 py-2 border rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
    bind:value={searchTerm}
    aria-label="Search files"
  />
  <span class="absolute left-3 top-3 text-gray-400">{ICONS.CLOSE}</span>
</div>
