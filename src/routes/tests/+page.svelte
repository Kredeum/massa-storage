<script lang="ts">
</script>

{#snippet pageTest(pageName: string)}
  <li><a class="text-blue-500 hover:underline" href="/tests/{pageName}">{pageName}</a></li>
{/snippet}

<ul class="list-disc space-y-2 pl-5">
  {@render pageTest("connect")}
  {@render pageTest("counter")}
</ul>
