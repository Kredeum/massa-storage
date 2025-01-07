<script lang="ts">
  import Connect from "$lib/components/Connect.svelte";
  import { Client } from "$lib/runes/client.svelte";

  const client = new Client();
</script>

<div class="flex h-32 flex-col items-center justify-center">
  <Connect {client} />
</div>
