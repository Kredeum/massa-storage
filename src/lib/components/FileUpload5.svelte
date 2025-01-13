<script lang="ts">
  import { Upload } from "lucide-svelte";

  let { files = $bindable() }: { files?: FileList } = $props();

  let dragOver = $state(false);
  let fileInput = $state<HTMLInputElement>();

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    dragOver = true;
  };

  const handleDragLeave = () => {
    dragOver = false;
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    dragOver = false;
    if (!e.dataTransfer?.files) return;

    files = e.dataTransfer.files;
  };

  const handleFileInput = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (!input.files) return;

    files = input.files;
  };
</script>

<div
  class="relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors duration-200 ease-in-out {dragOver
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
    <button type="button" class="font-medium text-blue-600 hover:text-blue-700" onclick={() => fileInput?.click()}> Click to upload </button>
    or drag and drop
  </p>
  <p class="text-xs text-gray-500">Any file type</p>
</div>
