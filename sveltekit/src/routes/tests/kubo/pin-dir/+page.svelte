<script lang="ts">
  import { onMount } from "svelte";
  import { createKuboClient } from "$lib/ts/kubo";
  import FileUpload from "$lib/components/fileManagement/FileUpload.svelte";
  import all from "it-all";
  import { CID } from "multiformats";
  import { create } from "kubo-rpc-client";

  let files = $state<FileList>();
  let cids = $state<unknown>(null);

  let kubo: ReturnType<typeof createKuboClient>;

  const filesHandle = async () => {
    if (!(files && files.length > 0)) return;
    console.log("filesHandle", files.length);

    try {
      let filesArray = [];
      for await (const file of files) {
        filesArray.push({
          path: file.name,
          content: new Uint8Array(await file.arrayBuffer())
        });
      }

      cids = await all(kubo.addAll(filesArray, { wrapWithDirectory: true }));
      console.log("filesHandle ~ cids:", cids);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  $effect(() => {
    filesHandle();
  });

  onMount(async () => {
    kubo = await createKuboClient();
  });
</script>

<div class="flex flex-col items-center justify-center space-y-8 p-4">
  <div class="w-full max-w-xl space-y-4">
    <FileUpload bind:files />

    <div>
      {#if cids}
        <pre>{JSON.stringify(cids, null, 2)}</pre>
      {/if}
    </div>
  </div>
</div>
