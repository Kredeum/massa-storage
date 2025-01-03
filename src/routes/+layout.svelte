<script lang="ts">
  import "$styles/app.css";
  import "tailwindcss/tailwind.css";
  import { Toaster } from "svelte-hot-french-toast";

  let { children } = $props();
</script>

<title>Bearby Connect test</title>

<Toaster />

<div class="container">
  {@render children()}
</div>
