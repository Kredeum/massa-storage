<script lang="ts">
  import { onMount } from "svelte";
  import { CID } from "multiformats/cid";

  import { createHelia, type Helia } from "helia";
  import { unixfs, type UnixFS } from "@helia/unixfs";
  import FileUpload5 from "$lib/components/FileUpload5.svelte";

  let helia: Helia;
  let fs: UnixFS;

  let files = $state<FileList>();
  let file0 = $derived<File | undefined>(files?.[0]);
  let cid = $state<string>("");
  let file = $state<string>("");

  onMount(async () => {
    helia = await createHelia();
    fs = unixfs(helia);
  });

  const fileHandle = async () => {
    if (!file0) return "";

    try {
      const arrayBuffer = await file0.arrayBuffer();
      const content = new Uint8Array(arrayBuffer);
      console.log("fileHandle ~ content:", content);
      const _cid = await fs.addFile({
        path: file0.name,
        content
      });
      cid = _cid.toString();
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const fileRetreive = async () => {
    if (!cid) return "";

    try {
      const parsedCid = CID.parse(cid);
      const chunks: Uint8Array[] = [];

      for await (const chunk of fs.cat(parsedCid)) {
        console.log("fileRetreive ~ chunk");
        chunks.push(chunk);
      }

      const blob = new Blob(chunks);
      const reader = new FileReader();

      reader.onloadend = () => {
        file = reader.result as string;
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Error retrieving file:", error);
    }
  };

  const inputHandle = async () => {
    await fileHandle();
    await fileRetreive();
  };
  $effect(() => {
    inputHandle();
  });
</script>

<div class="flex flex-col items-center justify-center space-y-8 p-4">
  <div class="w-full max-w-xl space-y-4">
    <FileUpload5 bind:files />

    <input type="text" bind:value={cid} placeholder="CID" class=" w-full flex-1 rounded border p-2" />
    {#if file}
      <div class="mt-4 rounded bg-gray-100 p-6">
        {#if file.startsWith("data:")}
          <div class="space-y-4">
            <img src={file} alt="Retreived content" class="h-auto max-w-full" />
            <div class="flex justify-end">
              <a href={file} download={file0?.name ?? "downloaded-file"} class="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Download {file0?.name ?? "File"}
              </a>
            </div>
          </div>
        {:else}
          <p class="whitespace-pre-wrap text-lg">{file}</p>
        {/if}
      </div>
    {/if}
  </div>
</div>
