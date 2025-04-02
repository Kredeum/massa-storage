<script lang="ts">
  // @ts-nocheck - This file uses modules with problematic type definitions
  import { getContext } from "svelte";
  import type { FileItem, CollectionItem, StatusType } from "$lib/ts/types";
  import { Check, X, Pin, Download } from "lucide-svelte";
  import type { Ipfs } from "$lib/runes/ipfs.svelte";
  import { STATUS_APPROVED, STATUS_PENDING, STATUS_REJECTED } from "@kredeum/massa-storage-common/src/constants";
  import { createKuboClient } from "$lib/ts/kubo";
  import JSZip from "jszip";
  import all from "it-all";
  import toast from "svelte-hot-french-toast";

  const ipfs: Ipfs = getContext("ipfs");
  const kubo = createKuboClient();

  let {
    item,
    onModerate,
    onPin,
    type = "file"
  }: {
    item: FileItem | CollectionItem;
    onModerate?: (data: { id: string; status: StatusType }) => void;
    onPin?: (cid: string) => void;
    type?: "file" | "collection";
  } = $props();

  const handleModerate = async (status: StatusType) => {
    if (item.status == status) return;
    if (status == STATUS_PENDING) return;

    const id = type === "file" ? (item as FileItem).cid : (item as CollectionItem).collectionCid;
    if (onModerate) {
      onModerate({ id, status });
    }
  };

  const handlePin = async () => {
    if (!(await kubo.ready())) {
      toast.error("Server IPFS not available");
      return;
    }

    const cid = type === "file" ? (item as FileItem).cid : (item as CollectionItem).collectionCid;
    if (onPin) {
      onPin(cid);
    }
  };

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  };

  const handleDownloadFile = async (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!(await kubo.ready())) {
      toast.error("IPFS not available");
      return;
    }

    try {
      const file = item as FileItem;
      if (file.blob) {
        const url = URL.createObjectURL(file.blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (file.cid) {
        const chunks = [];
        for await (const chunk of kubo.cat(file.cid)) {
          chunks.push(chunk);
        }
        const blob = new Blob(chunks);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error(`Error downloading file: ${getErrorMessage(error)}`);
    }
  };

  const handleDownloadZip = async (e: MouseEvent) => {
    e.stopPropagation();
    if (!(await kubo.ready())) {
      const url = `https://dweb.link/ipfs/${(item as CollectionItem).collectionCid}`;
      window.open(url, "_blank");
      return;
    }
    try {
      const collection = item as CollectionItem;

      // Create a zip file containing all files in the collection
      const files = [];
      const collectionStats = await all(kubo.ls(collection.collectionCid));

      if (!collectionStats || collectionStats.length === 0) {
        toast.error("No files found in collection");
        return;
      }

      for (const file of collectionStats) {
        try {
          const chunks = await all(kubo.cat(file.cid));
          // Calculate total length
          const totalLength = chunks.reduce((acc: number, chunk: Uint8Array) => acc + chunk.length, 0);
          // Create a new Uint8Array with the total length
          const content = new Uint8Array(totalLength);
          // Copy all chunks into the new array
          let offset = 0;
          for (const chunk of chunks) {
            content.set(chunk, offset);
            offset += chunk.length;
          }
          files.push({
            name: file.name,
            content: content
          });
        } catch (error) {
          console.error(`Failed to download file ${file.name}:`, error);
          toast.error(`Failed to download file ${file.name}: ${getErrorMessage(error)}`);
          // Continue with other files even if one fails
        }
      }

      if (files.length === 0) {
        toast.error("Failed to download any files from the collection");
        return;
      }

      // Create a zip file
      const zip = new JSZip();
      files.forEach((file) => {
        zip.file(file.name, file.content);
      });

      // Generate and download the zip file
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${collection.name}.zip`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Download completed");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error(`Download failed: ${getErrorMessage(error)}`);
    }
  };
</script>

<div class="flex flex-nowrap items-center justify-end gap-1 sm:gap-2">
  {#if onModerate}
    <button
      onclick={(e) => {
        e.stopPropagation();
        handleModerate("1");
      }}
      class="cursor-pointer text-green-600 hover:text-green-900"
      disabled={item.status == STATUS_APPROVED}
    >
      <Check size={20} strokeWidth={3} class="sm:size-[22px]" />
    </button>
    <button
      onclick={(e) => {
        e.stopPropagation();
        handleModerate("0");
      }}
      class="cursor-pointer text-red-600 hover:text-red-900"
      disabled={item.status == STATUS_REJECTED}
    >
      <X size={20} strokeWidth={3} class="sm:size-[22px]" />
    </button>
  {/if}

  {#if onPin}
    <button
      onclick={(e) => {
        e.stopPropagation();
        handlePin();
      }}
      class="cursor-pointer transition-colors hover:text-blue-900"
      class:text-blue-600={item.isPinned}
      class:text-gray-400={!item.isPinned}
    >
      <Pin size={20} strokeWidth={2} class={`sm:size-[22px] ${!item.isPinned ? "rotate-45" : ""}`} />
    </button>
  {/if}

  {#if type === "file"}
    <button onclick={handleDownloadFile} class="cursor-pointer text-gray-500 transition-colors hover:text-blue-900" aria-label="Download file">
      <Download size={20} strokeWidth={2} class="sm:size-[22px]" />
    </button>
  {:else}
    <button onclick={handleDownloadZip} class="cursor-pointer text-gray-500 transition-colors hover:text-blue-900" aria-label="Download collection as ZIP">
      <Download size={20} strokeWidth={2} class="sm:size-[22px]" />
    </button>
  {/if}
</div>
