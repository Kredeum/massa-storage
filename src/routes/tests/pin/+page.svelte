<script lang="ts">
  import FileUpload from "$lib/components/FileUpload.svelte";
  import type { FileItem } from "$lib/types";

  const handleFilesSelected = (files: FileItem[]) => {
    console.log("Files selected:", files);
  };
</script>

<div class="flex h-32 flex-col items-center justify-center">
  <FileUpload onFilesSelected={handleFilesSelected} />
</div>
