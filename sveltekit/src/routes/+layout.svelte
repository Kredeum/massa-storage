<script lang="ts">
  import "$styles/app.css";
  import "tailwindcss/tailwind.css";
  import { Toaster } from "svelte-hot-french-toast";

  let { children } = $props();
</script>

<title>Massa Storage</title>

<Toaster />
<div class="w-full">
  {@render children()}
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: system-ui, sans-serif;
  }
</style>
