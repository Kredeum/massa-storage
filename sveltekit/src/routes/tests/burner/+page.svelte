<script lang="ts">
  import { BURNER_WALLET_KEY } from "$lib/ts/config";
  import { Writer } from "$lib/runes/writer.svelte";
  import Connect from "$lib/components/Connect.svelte";

  const client = new Writer({ privateKey: BURNER_WALLET_KEY });
</script>

<div class="flex h-32 flex-col items-center justify-center">
  <Connect {client} />
</div>
