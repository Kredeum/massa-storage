<script lang="ts">
  import type { PageData } from "./$types";
  import { page } from "$app/state";
  import FileManagement from "$lib/components/fileManagement/FileManagement.svelte";

  let dirCid = $state<string | null>(null);

  // Bind dirCid to page.data using a rune
  $effect(() => {
    dirCid = page.data?.dirCid ?? null;
  });
</script>

<FileManagement {dirCid} />

<!-- lis sur le kubo cid en parametre -->
