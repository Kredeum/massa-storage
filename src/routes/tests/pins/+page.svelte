<script lang="ts">
  import { onMount } from "svelte";
  import { CID } from "multiformats/cid";

  import { IDBBlockstore } from "blockstore-idb";
  import { createHelia, type Helia } from "helia";
  import { unixfs, type UnixFS } from "@helia/unixfs";

  import FileUpload from "$lib/components/FileUpload.svelte";
  import all from "it-all";

  // blocks storage inside browser with indexedDB
  const blockstore = new IDBBlockstore("helia/blockstore");

  let helia: Helia;
  let fs: UnixFS;

  let files = $state<FileList>();
  let file0 = $derived<File | undefined>(files?.[0]);
  let cid = $state<string>("");
  let file = $state<string>("");

  onMount(async () => {
    await blockstore.open();
    helia = await createHelia({ blockstore });
    fs = unixfs(helia);

    await pinsList();
  });

  const pinsList = async () => {
    const pins = await all(helia.pins.ls());
    console.info("Total pins found:", pins.length);
  };

  const fileRetreive = async (cid?: string) => {
    if (!cid) return "";

    try {
      const parsedCid = CID.parse(cid);
      const chunks = await all(fs.cat(parsedCid));

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

  $effect(() => {
    fileRetreive(cid);
  });
</script>

<div class="flex flex-col items-center justify-center space-y-8 p-4">
  <div class="w-full max-w-xl space-y-4">
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
