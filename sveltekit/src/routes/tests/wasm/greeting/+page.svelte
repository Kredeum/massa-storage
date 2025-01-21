<script lang="ts">
  import { Greeting } from "$lib/runes/greeting.svelte";

  const greeting = new Greeting();
</script>

<div class="flex h-32 flex-col items-center justify-center">
  <div class="mt-4">
    <button onclick={greeting.read} class="button-standard">
      Greeting = {greeting.greeting || "?"}
    </button>
  </div>
</div>
