<script lang="ts">
  import { getContext } from "svelte";
  import type { FileItem } from "$lib/ts/types";
  import { Check, X, Pin } from "lucide-svelte";
  import type { Ipfs } from "$lib/runes/ipfs.svelte";

  const ipfs: Ipfs = getContext("ipfs");

  let isModerator = $derived.by(() => ipfs?.isModeratorFunc(ipfs?.address));

  let {
    file,
    onModerate,
    onPin
  }: {
    file: FileItem;
    onModerate: (data: { id: string; status: FileItem["status"] }) => void;
    onPin: (id: string) => void;
  } = $props();

  function handleModerate(status: FileItem["status"]) {
    onModerate({ id: file.cid, status });
  }

  function handlePin() {
    onPin(file.cid);
  }

  async function handleDownload() {
    try {
      if (!file.blob) {
        console.error("File blob is not available");
        return;
      }
      const url = URL.createObjectURL(file.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  }
</script>

<div class="flex items-center justify-end gap-2">
  {#if isModerator}
    <button
      onclick={(e) => {
        e.stopPropagation();
        handleModerate("Approved");
      }}
      class="cursor-pointer text-green-600 hover:text-green-900"
      disabled={file.status === "Approved"}
    >
      <Check size={22} strokeWidth={3} />
    </button>
    <button
      onclick={(e) => {
        e.stopPropagation();
        handleModerate("Rejected");
      }}
      class="cursor-pointer text-red-600 hover:text-red-900"
      disabled={file.status === "Rejected"}
    >
      <X size={22} strokeWidth={3} />
    </button>
  {/if}

  <button
    onclick={(e) => {
      e.stopPropagation();
      handlePin();
    }}
    class="cursor-pointer transition-colors hover:text-blue-900"
    class:text-blue-600={file.isPinned}
    class:text-gray-400={!file.isPinned}
  >
    <Pin size={22} strokeWidth={2} class={!file.isPinned ? "rotate-45" : ""} />
  </button>
  <button
    onclick={(e) => {
      e.stopPropagation();
      handleDownload();
    }}
    class="cursor-pointer text-gray-500 transition-colors hover:text-blue-900"
    aria-label="Download file"
  >
    <svg class="h-[22px] w-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  </button>
</div>
