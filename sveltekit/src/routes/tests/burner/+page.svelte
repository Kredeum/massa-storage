<script lang="ts">
  import { BURNER_WALLET_KEY_MODERATOR, BURNER_WALLET_KEY_UPLOADER, BURNER_WALLET_KEY_PINNER } from "$lib/ts/config";
  import { PrivateKeyProvider, Writer } from "$lib/runes/writer.svelte";
  import Connect from "$lib/components/Connect.svelte";

  const clientUploader = new Writer(new PrivateKeyProvider(BURNER_WALLET_KEY_UPLOADER));
  const clientModerator = new Writer(new PrivateKeyProvider(BURNER_WALLET_KEY_MODERATOR));
  const clientPinner = new Writer(new PrivateKeyProvider(BURNER_WALLET_KEY_PINNER));
</script>

<div class="flex h-32 flex-col items-center justify-center">
  <div class="p-2">
    <Connect client={clientUploader} />
  </div>
  <div class="p-2">
    <Connect client={clientModerator} />
  </div>
  <div class="p-2">
    <Connect client={clientPinner} />
  </div>
</div>
