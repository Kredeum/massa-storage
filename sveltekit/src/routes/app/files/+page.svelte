<script lang="ts">
  import type { PageData } from "./$types";
  import { page } from "$app/state";
  import CollectionFiles from "$lib/components/fileManagement/CollectionFiles.svelte";
</script>

<div class="container mx-auto py-6">
  <CollectionFiles />
</div>
