<script lang="ts">
</script>

{#snippet pageTest(pageName: string)}
  <li><a class="text-blue-500 hover:underline" href="/tests/{pageName}">{pageName}</a></li>
{/snippet}

{#await import.meta.glob("./*/+page.svelte") then modules}
  <ul class="list-disc space-y-2 pl-5">
    {#each Object.keys(modules) as path}
      {@const pageName = path.split("/")[1]}
      {@render pageTest(pageName)}
    {/each}
  </ul>
{/await}
