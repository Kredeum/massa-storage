<script lang="ts">
  import { BURNER_WALLET_KEY_MODERATOR, BURNER_WALLET_KEY_UPLOADER, BURNER_WALLET_KEY_PINNER } from "$lib/ts/config";
  import { Writer } from "$lib/runes/writer.svelte";
  import Connect from "$lib/components/Connect.svelte";

  const client1 = new Writer({ privateKey: BURNER_WALLET_KEY_MODERATOR });
  const client2 = new Writer({ privateKey: BURNER_WALLET_KEY_UPLOADER });
  const client3 = new Writer({ privateKey: BURNER_WALLET_KEY_PINNER });
</script>

<div class="flex h-32 flex-col items-center justify-center">
  <div class="p-2">
    <Connect client={client1} />
  </div>
  <div class="p-2">
    <Connect client={client2} />
  </div>
  <div class="p-2">
    <Connect client={client3} />
  </div>
</div>
