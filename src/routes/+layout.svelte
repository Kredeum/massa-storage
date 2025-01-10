<script lang="ts">
  import "$styles/app.css";
  import "tailwindcss/tailwind.css";
  import { Toaster } from "svelte-hot-french-toast";
  import Toast from "$lib/components/Toast.svelte";

  let { children } = $props();
</script>

<title>Bearby Connect test</title>

<Toaster />
<Toast />
<div class="container">
  {@render children()}
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: system-ui, sans-serif;
  }
</style>
