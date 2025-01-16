<script lang="ts">
  import type { FileItem } from "$lib/types/file";
  import { Check, X, Pin } from "lucide-svelte";

  let {
    file,
    onModerate,
    onPin
  }: {
    file: FileItem;
    onModerate: (data: { id: number; status: FileItem["status"] }) => void;
    onPin: (id: number) => void;
  } = $props();

  function handleModerate(status: FileItem["status"]) {
    onModerate({ id: file.id, status });
  }

  function handlePin() {
    onPin(file.id);
  }
</script>

<div class="flex items-center justify-end gap-3.5">
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
  <button
    onclick={(e) => {
      e.stopPropagation();
      handlePin();
    }}
    class="cursor-pointer transition-colors hover:text-blue-900"
    class:text-blue-600={file.isPinned}
    class:text-gray-400={!file.isPinned}
  >
    <Pin size={22} strokeWidth={3} class={!file.isPinned ? "rotate-45" : ""} />
  </button>
</div>
