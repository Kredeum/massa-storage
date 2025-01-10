<script lang="ts">
  import FileUpload from "$lib/components/FileUpload.svelte";
  import type { FileItem } from "$lib/types";

  const handleFilesSelected = (files: FileItem[]) => {
    files.forEach(async (file) => {
      if (!file) return;
      console.log("File name:", file.name);
      try {
        // First, add the file to IPFS
        const formData = new FormData();
        formData.append("file", file.blob || file);

        const addResponse = await fetch("http://127.0.0.1:5001/pins", {
          method: "POST",
          headers: {
            "Access-Control-Allow-Origin": "*"
          },
          body: formData
        });

        if (!addResponse.ok) throw new Error(`Failed to add file: ${addResponse.statusText}`);
        const { Hash } = await addResponse.json();
        console.log("Add Hash:", Hash);

        // Then pin it
        const pinResponse = await fetch(`http://127.0.0.1:5001/api/v0/pin/add?arg=${Hash}`, {
          method: "POST"
        });

        if (!pinResponse.ok) throw new Error(`Failed to pin file: ${pinResponse.statusText}`);
        const pinResult = await pinResponse.json();
        console.log(`File ${file.name} added and pinned with CID: ${Hash}`);
      } catch (error) {
        console.error(`Error handling file ${file.name}:`, error);
      }
    });
  };
</script>

<div class="flex h-32 flex-col items-center justify-center">
  <FileUpload onFilesSelected={handleFilesSelected} />
</div>
