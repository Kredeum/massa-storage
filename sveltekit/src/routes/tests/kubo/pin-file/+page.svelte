<script lang="ts">
  import { onMount } from "svelte";
  import { createKuboClient } from "$lib/ts/kubo";
  import FileUpload from "$lib/components/fileManagement/FileUpload.svelte";
  import all from "it-all";
  import { CID } from "multiformats";

  let kubo: ReturnType<typeof createKuboClient>;

  let files = $state<FileList>();
  let file0 = $derived<File | undefined>(files?.[0]);
  let cid = $state<string>("");
  let file = $state<string>("");

  const fileHandle = async () => {
    if (!file0) return "";

    try {
      const arrayBuffer = await file0.arrayBuffer();
      const content = new Uint8Array(arrayBuffer);

      cid = (await kubo.addAndPin(content)).toString();
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const fileRetreive = async () => {
    if (!cid) return "";

    try {
      const chunks = await all(kubo.cat(CID.parse(cid)));
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
    fileHandle();
  });

  onMount(async () => {
    kubo = await createKuboClient();
  });
</script>

<div class="flex flex-col items-center justify-center space-y-8 p-4">
  <div class="w-full max-w-xl space-y-4">
    <FileUpload bind:files />

    <div class="flex gap-2">
      <input type="text" bind:value={cid} placeholder="CID" class="w-full flex-1 rounded border p-2" />
      <button onclick={fileRetreive} class="w-[140px] whitespace-nowrap rounded bg-blue-500 p-2 px-6 text-white hover:bg-blue-600">Retrieve File</button>
    </div>
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
