<script lang="ts">
</script>

{#snippet pageTest(pageName: string)}
  <li><a class="text-blue-500 hover:underline" href="/tests/{pageName}">{pageName}</a></li>
{/snippet}

<ul class="list-disc space-y-2 pl-5">
  {@render pageTest("pin")}
  {@render pageTest("counter")}
  {@render pageTest("connect")}
  <!-- {@render pageTest("burner")} -->
</ul>
