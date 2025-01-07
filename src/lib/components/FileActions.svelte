<script lang="ts">
  import type { FileItem } from "$lib/types/file";

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
    console.log("🚀 ~ handleModerate ~ id: file.id, status:", file.id, status);
  }

  function handlePin() {
    onPin(file.id);
    console.log("🚀 ~ handlePin ~ onPin(file.id):", file.id);
  }
</script>

<div class="flex items-center justify-end gap-3">
  <button
    onclick={(e) => {
      e.stopPropagation();
      handleModerate("Approved");
    }}
    class="text-green-600 hover:text-green-900"
    disabled={file.status === "Approved"}
  >
    ✓
  </button>
  <button
    onclick={(e) => {
      e.stopPropagation();
      handleModerate("Rejected");
    }}
    class="text-red-600 hover:text-red-900"
    disabled={file.status === "Rejected"}
  >
    ✗
  </button>
  <button
    onclick={(e) => {
      e.stopPropagation();
      handlePin();
    }}
    class="transition-colors hover:text-blue-900"
    class:text-blue-600={file.isPinned}
    class:text-gray-400={!file.isPinned}
  >
    📌
  </button>
</div>
