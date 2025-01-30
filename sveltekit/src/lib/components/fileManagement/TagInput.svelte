<script lang="ts">
  // import { X } from "lucide-svelte";
  interface Props {
    selectedFiles: string[];
    files: import("$lib/ts/types").FileItem[];
    onAddTag: (tag: string, fileIds: string[]) => void;
  }

  let { selectedFiles = [], files = [], onAddTag }: Props = $props();
  // let tagText = $state("");
  // let removeBtn = $state("<button class='material-symbols-outlined'>X</button>");
  let newTag = $state("");

  function handleAddTag() {
    if (newTag.trim() && selectedFiles.length > 0) {
      onAddTag(newTag.trim(), selectedFiles);
      newTag = "";
    }
  }

  function handleKeyPress(e: KeyboardEvent) {
    if (e.key === "Enter") {
      handleAddTag();
    }
  }

  const canAddTag = $derived(selectedFiles.length > 0);
</script>

<div class="flex items-center space-x-2">
  <input
    type="text"
    bind:value={newTag}
    onkeypress={handleKeyPress}
    placeholder={selectedFiles.length > 0 ? "Add tag..." : "Select files to add a tag"}
    class="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    disabled={!canAddTag}
  />
  <button onclick={handleAddTag} disabled={!canAddTag || !newTag.trim()} class="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"> Add Tag </button>
</div>
