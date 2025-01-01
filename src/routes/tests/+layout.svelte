<script lang="ts">
  let { children } = $props();
</script>

<div class="flex min-h-screen flex-col">
  <div class="p-8">
    <h1 class="mb-6 text-2xl font-bold">
      <a href="/app">App</a>
    </h1>
    <h1 class="mb-6 text-2xl font-bold">
      <a href="/tests">Tests</a>
    </h1>

    <main class="relative flex flex-1 flex-col">{@render children()}</main>
  </div>
</div>
