<script lang="ts">
  import { onMount } from "svelte";
  import { CID } from "multiformats/cid";

  import { IDBBlockstore } from "blockstore-idb";
  import { IDBDatastore } from "datastore-idb";

  import { createHelia, type Helia } from "helia";
  import { unixfs, type UnixFS } from "@helia/unixfs";

  import all from "it-all";

  // blocks storage inside browser with indexedDB
  const blockstore = new IDBBlockstore("helia/blockstore");
  const datastore = new IDBDatastore("helia/datastore");

  let helia: Helia;
  let fs: UnixFS;

  let files = $state<FileList>();
  let file0 = $derived<File | undefined>(files?.[0]);
  let file = $state<string>("");
  const cids = $state<Array<string>>([]);

  onMount(async () => {
    await blockstore.open();
    await datastore.open();
    helia = await createHelia({ blockstore, datastore });
    fs = unixfs(helia);
    await helia.start();

    for await (const pin of helia.pins.ls()) {
      cids.push(pin.cid.toString());
    }
  });

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
</script>

<div class="flex flex-col items-center justify-center space-y-8 p-4">
  <ul class="pins-list" role="list">
    {#each cids as cid}
      <li>
        <button type="button" onclick={() => fileRetreive(cid)} onkeydown={(e) => e.key === "Enter" && fileRetreive(cid)}>
          {cid}
        </button>
      </li>
    {/each}
  </ul>
  <div class="w-full max-w-xl space-y-4">
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

<style>
  .pins-list {
    list-style: none;
    padding: 0;
    margin: 20px 0;
    max-width: 600px;
  }

  .pins-list li {
    padding: 12px 16px;
    margin: 8px 0;
    background-color: #f8f9fa;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid #e9ecef;
    word-break: break-all;
  }

  .pins-list li:hover {
    background-color: #e9ecef;
    transform: translateX(5px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
</style>
