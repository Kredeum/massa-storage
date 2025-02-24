<script lang="ts">
  import type { PageData } from "./$types";
  import { page } from "$app/state";
  import FileManagement from "$lib/components/fileManagement/FileManagement.svelte";

  let collectionCid = $state<string | null>(null);

  // Bind collectionCid to page.data using a rune
  $effect(() => {
    collectionCid = page.data?.collectionCid ?? null;
  });
</script>

<div class="container mx-auto py-6">
  <FileManagement {collectionCid} />
</div>

<!--si cid définit montre la collection sinon affiche tous les fichiers-->
<!-- lis sur le kubo cid en parametre -->
