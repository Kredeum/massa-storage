<script lang="ts">
  import type { FileItem, StatusType } from "$lib/ts/types";

  import { STATUS_APPROVED, STATUS_PENDING, STATUS_REJECTED } from "@kredeum/massa-storage-common/src/constants";
  let {
    files = [],
    paginatedFiles = [],
    onSelectionChange,
    showMenu = false,
    buttonRef,
    onClose
  } = $props<{
    files: FileItem[];
    paginatedFiles: FileItem[];
    onSelectionChange: (selected: string[]) => void;
    showMenu: boolean;
    buttonRef: HTMLButtonElement | null;
    onClose: () => void;
  }>();

  let menuRef = $state<HTMLDivElement | null>(null);

  function handleSelectAll() {
    const allFileIds = files.map((file: FileItem) => file.cid);
    onSelectionChange(allFileIds);
    onClose();
  }

  function handleSelectCurrentPage() {
    const currentPageIds = paginatedFiles.map((file: FileItem) => file.cid);
    onSelectionChange(currentPageIds);
    onClose();
  }

  function handleSelectApprovedFiles() {
    const approvedFiles = files.filter((file: { status: string }) => file.status == STATUS_APPROVED);
    const approvedIds = approvedFiles.map((file: FileItem) => file.cid);
    onSelectionChange(approvedIds);
    onClose();
  }

  function handleSelectPendingFiles() {
    const pendingFiles = files.filter((file: { status: string }) => file.status == STATUS_PENDING);
    const pendingIds = pendingFiles.map((file: FileItem) => file.cid);
    onSelectionChange(pendingIds);
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
