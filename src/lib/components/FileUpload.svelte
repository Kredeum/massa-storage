<script lang="ts">
  import { Upload } from "lucide-svelte";
  import type { FileItem, FileType } from "$lib/types/file";
  import { calculateCID } from "$lib/utils/cid";
  import { toastStore } from "$lib/stores/toast";

  export let onFilesSelected: (files: FileItem[]) => void;
  let dragOver = false;
  let fileInput: HTMLInputElement;

  const MAX_FILE_SIZE = 1024 * 1024 * 100; // 100MB

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

  function getFileType(mimeType: string): FileType {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "sound";
    return "document";
  }

  function formatFileSize(bytes: number): string {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  async function handleFiles(files: FileList) {
    const filePromises = Array.from(files).map(async (file, index) => {
      try {
        const type = getFileType(file.type);

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
          const errorMsg = `Le fichier ${file.name} dépasse la taille maximale autorisée de ${formatFileSize(MAX_FILE_SIZE)}`;
          toastStore.error(errorMsg);
          return null;
        }

        const cid = await calculateCID(file);
        if (!cid) {
          throw new Error("Impossible de calculer le CID du fichier");
        }

        const fileItem: FileItem = {
          id: Date.now() + index,
          name: file.name,
          size: formatFileSize(file.size),
          type,
          status: "Pending",
          cid,
          isPinned: false,
          lastModified: new Date(file.lastModified).toISOString(),
          mimeType: file.type,
          blob: ["image", "video"].includes(type) ? file : undefined
        };

        return fileItem;
      } catch (error: unknown) {
        const errorMsg = `Erreur lors du traitement du fichier ${file.name}: ${error instanceof Error ? error.message : "Erreur inconnue"}`;
        toastStore.error(errorMsg);
        return null;
      }
    });

    const results = await Promise.all(filePromises);
    const validFiles = results.filter((file): file is FileItem => file !== null);

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
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
