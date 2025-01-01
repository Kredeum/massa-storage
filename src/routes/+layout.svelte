<script lang="ts">
  import "$styles/app.css";
  import "tailwindcss/tailwind.css";
  let { children } = $props();
</script>

<title>Bearby Connect test</title>

<div class="container">
  {@render children()}
</div>
