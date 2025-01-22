<script lang="ts">
  import type { FileItem } from "$lib/ts/types";

  let {
    files = [],
    paginatedFiles = [],
    onSelectionChange,
    onFilterChange,
    showMenu = false,
    buttonRef,
    onClose
  } = $props<{
    files: FileItem[];
    paginatedFiles: FileItem[];
    onSelectionChange: (selected: number[]) => void;
    onFilterChange: (status: "Approved" | "Pending" | "all") => void;
    showMenu: boolean;
    buttonRef: HTMLButtonElement | null;
    onClose: () => void;
  }>();

  let menuRef = $state<HTMLDivElement | null>(null);

  function handleSelectAll() {
    const allFileIds = files.map((file: { id: any }) => file.id);
    onSelectionChange(allFileIds);
    onClose();
  }

  function handleSelectCurrentPage() {
    const currentPageIds = paginatedFiles.map((file: { id: any }) => file.id);
    onSelectionChange(currentPageIds);
    onClose();
  }

  function handleSelectApprovedFiles() {
    const approvedFiles = files.filter((file: { status: string }) => file.status === "Approved");
    const approvedIds = approvedFiles.map((file: { id: any }) => file.id);
    onSelectionChange(approvedIds);
    onFilterChange("Approved");
    onClose();
  }

  function handleSelectPendingFiles() {
    const pendingFiles = files.filter((file: { status: string }) => file.status === "Pending");
    const pendingIds = pendingFiles.map((file: { id: any }) => file.id);
    onSelectionChange(pendingIds);
    onFilterChange("Pending");
    onClose();
  }
</script>

{#if showMenu && buttonRef}
  <div
    bind:this={menuRef}
    class="fixed w-44 rounded-md border border-gray-200 bg-white py-0.5 shadow-lg"
    role="menu"
    tabindex="-1"
    style="left: {buttonRef.getBoundingClientRect().right}px; top: {buttonRef.getBoundingClientRect().top}px; z-index: 9999;"
  >
    <button type="button" class="w-full cursor-pointer px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100" onclick={handleSelectAll} role="menuitem"> Select All </button>
    <button type="button" class="w-full cursor-pointer px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100" onclick={handleSelectCurrentPage} role="menuitem"> Select Current Page </button>
    <button type="button" class="w-full cursor-pointer px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100" onclick={handleSelectApprovedFiles} role="menuitem">
      Select Approved Files
    </button>
    <button type="button" class="w-full cursor-pointer px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100" onclick={handleSelectPendingFiles} role="menuitem"> Select Pending Files </button>
  </div>
{/if}
