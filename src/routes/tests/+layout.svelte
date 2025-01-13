<script lang="ts">
  import { page } from "$app/state";
  // console.info("page:", $state.snapshot(page));
  let { children } = $props();
</script>

<div class="flex min-h-screen flex-col">
  <div class="p-8">
    <h1 class="mb-6 text-2xl font-bold">
      <div class="flex items-center gap-10">
        <a href="/app">App</a>
        <a href="/tests">Tests</a>
      </div>
    </h1>
    <h1 class="mb-6 text-2xl">
      {page.route.id}
    </h1>

    <main class="relative flex flex-1 flex-col">{@render children()}</main>
  </div>
</div>
