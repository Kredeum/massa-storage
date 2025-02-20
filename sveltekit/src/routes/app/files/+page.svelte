<script lang="ts">
  import type { PageData } from "./$types";
  import { page } from "$app/state";
  import FileManagement from "$lib/components/fileManagement/FileManagement.svelte";
</script>

<div class="container mx-auto py-6">
  <FileManagement />
</div>
