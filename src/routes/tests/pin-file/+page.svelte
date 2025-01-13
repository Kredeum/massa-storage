<script lang="ts">
  import { onMount } from "svelte";
  import { CID } from "multiformats/cid";

  import { createHelia, type Helia } from "helia";
  import { unixfs, type UnixFS } from "@helia/unixfs";
  import FileUpload5 from "$lib/components/FileUpload.svelte";

  let helia: Helia;
  let fs: UnixFS;

  let cidInput = $state<string>("");
  let files = $state<FileList>();
  let fileInput = $derived<File | undefined>(files?.[0]);
  let fileRetreived = $state<string>("");

  onMount(async () => {
    helia = await createHelia();
    fs = unixfs(helia);
  });

  const fileHandle = async (fileData?: File) => {
    if (!fileData) return "";

    try {
      const arrayBuffer = await fileData.arrayBuffer();
      const content = new Uint8Array(arrayBuffer);
      const cid = await fs.addFile({
        path: fileData.name,
        content
      });

      cidInput = cid.toString();
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
  $effect(() => {
    fileHandle(fileInput);
  });

  const fileRetrieve = async () => {
    if (!cidInput.trim()) return;

    try {
      const parsedCid = CID.parse(cidInput);
      const decoder = new TextDecoder();
      let content = "";

      for await (const chunk of fs.cat(parsedCid)) {
        content += decoder.decode(chunk, { stream: true });
      }

      fileRetreived = content;
    } catch (error) {
      console.error("Error retrieving file:", error);
      fileRetreived = "Error: Could not retrieve file";
    }
  };
</script>

<div class="flex flex-col items-center justify-center space-y-8 p-4">
  <div class="w-full max-w-3xl space-y-4">
    <FileUpload5 bind:files />

    <form onsubmit={fileRetrieve}>
      <div class="flex gap-2">
        <input type="text" bind:value={cidInput} placeholder="Enter CID" class="input" />
        <button type="submit" class="button">Retrieve</button>
      </div>
    </form>
    {#if fileRetreived}
      <div class="mt-4 rounded bg-gray-100 p-6">
        <p class="whitespace-pre-wrap text-lg">{fileRetreived}</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .input {
    @apply min-w-[400px] flex-1 rounded border p-2;
  }

  .button {
    @apply w-[140px] whitespace-nowrap rounded bg-blue-500 p-2 px-6 text-white hover:bg-blue-600;
  }
</style>
