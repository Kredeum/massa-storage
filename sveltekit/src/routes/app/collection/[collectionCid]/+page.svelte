<script lang="ts">
  import type { PageData } from "./$types";
  import { page } from "$app/state";
  import FileManagement from "$lib/components/fileManagement/FileManagement.svelte";

  const collectionCid = $derived(page.data?.collectionCid ?? null);
</script>

<div class="container mx-auto py-6">
  <FileManagement {collectionCid} />
</div>

<!--si cid définit montre la collection sinon affiche tous les fichiers-->
<!-- lis sur le kubo cid en parametre -->
