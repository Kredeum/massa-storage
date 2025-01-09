<script lang="ts">
  import { Upload } from "lucide-svelte";
  import type { FileItem } from "$lib/types";
  import { calculateCID } from "$lib/utils/cid";

  export let onFilesSelected: (files: FileItem[]) => void;
  let dragOver = false;
  let fileInput: HTMLInputElement;

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    dragOver = true;
  }

  function handleDragLeave() {
    dragOver = false;
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    dragOver = false;
    if (e.dataTransfer?.files) {
      handleFiles(e.dataTransfer.files);
    }
  }

  function handleFileInput(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files) {
      handleFiles(input.files);
    }
  }

  async function handleFiles(files: FileList) {
    const filePromises = Array.from(files).map(async (file, index) => {
      const type = getFileType(file.type);
      const cid = await calculateCID(file);
      return {
        id: Date.now() + index,
        name: file.name,
        size: formatFileSize(file.size),
        type,
        status: "Pending" as const,
        isPinned: false,
        lastModified: new Date(file.lastModified).toISOString(),
        mimeType: file.type,
        cid,
        ...(["image", "video", "document"].includes(type) ? { blob: file } : {})
      } satisfies FileItem;
    });

    const fileItems = await Promise.all(filePromises);
    onFilesSelected(fileItems);
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  function getFileType(mimeType: string): FileItem["type"] {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "sound";
    if (
      mimeType === "application/pdf" ||
      mimeType === "application/msword" ||
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimeType === "application/vnd.ms-excel" ||
      mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      mimeType === "application/vnd.ms-powerpoint" ||
      mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
      mimeType.startsWith("text/")
    )
      return "document";
    return "document";
  }
</script>

<div
  class="relative flex h-48 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors duration-200 ease-in-out {dragOver
    ? 'border-blue-500 bg-blue-50'
    : 'border-gray-300 bg-gray-50'}"
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
  role="region"
  aria-label="File upload drop zone"
>
  <input type="file" bind:this={fileInput} onchange={handleFileInput} class="hidden" multiple accept="*/*" />

  <Upload class="mb-4 h-12 w-12 text-gray-400" />
  <p class="mb-2 text-sm text-gray-500">
    <button type="button" class="font-medium text-blue-600 hover:text-blue-700" onclick={() => fileInput.click()}> Click to upload </button>
    or drag and drop
  </p>
  <p class="text-xs text-gray-500">Any file type</p>
</div>
