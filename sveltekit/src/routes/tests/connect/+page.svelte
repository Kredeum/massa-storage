<script lang="ts">
  import Connect from "$lib/components/Connect.svelte";
  import { Writer } from "$lib/runes/writer.svelte";

  const client0 = new Writer();
</script>

<div class="flex h-32 flex-col items-center justify-center">
  <div class="p-2">
    <Connect client={client0} />
  </div>
</div>
