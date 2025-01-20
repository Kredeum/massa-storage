<!-- Header.svelte -->
<script lang="ts">
  import { base } from "$app/paths";
  import { Client } from "$lib/runes/client.svelte";
  import logoMassa from "$lib/assets/logoMassa.svg";
  import Connect from "$lib/components/Connect.svelte";

  const client = new Client();
</script>

<header class="flex h-16 w-full items-center border-b border-gray-200 bg-white px-4 shadow-sm">
  <nav class="container mx-auto flex items-center justify-between">
    <div class="flex items-center gap-8">
      <a href="{base}/" class="flex items-center gap-2 text-lg font-semibold text-gray-900">
        <img src={logoMassa} alt="Massa Logo" class="h-8 w-8" />
        Massa Storage
      </a>
      <a href="{base}/app" class="text-sm text-gray-600 hover:text-gray-900">Files</a>
      <a href="{base}/app/profiles" class="text-sm text-gray-600 hover:text-gray-900">Profiles</a>
      <a href="{base}/tests" class="text-sm text-gray-600 hover:text-gray-900">Tests</a>
      <a href="https://github.com/kredeum/massa-storage" target="_blank" rel="noopener noreferrer" class="text-sm text-gray-600 hover:text-gray-900"> GitHub </a>
    </div>
    <div class="flex items-center">
      <Connect {client} />
    </div>
  </nav>
</header>
