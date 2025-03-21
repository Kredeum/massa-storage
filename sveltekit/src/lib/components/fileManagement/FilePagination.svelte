<script lang="ts">
  import type { PropsFilePagination } from "$lib/ts/types";
  let { currentPage, totalPages, itemsPerPage, totalItems, setPage }: PropsFilePagination = $props();

  function handlePrevious() {
    if (currentPage > 1) {
      setPage(currentPage - 1);
    }
  }

  function handleNext() {
    if (currentPage < totalPages) {
      setPage(currentPage + 1);
    }
  }

  function handleGoToPage(page: number) {
    setPage(page);
  }

  const currentClass = (i: number) => (currentPage === i ? "bg-blue-50 border-blue-500 text-blue-600" : "text-gray-700 hover:bg-gray-50");
</script>

<div class="mt-4 flex items-center justify-between">
  <div class="flex flex-1 justify-between sm:hidden">
    <button
      onclick={handlePrevious}
      class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:cursor-pointer hover:bg-gray-50"
      disabled={currentPage === 1}
    >
      Previous
    </button>
    <button
      onclick={handleNext}
      class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:cursor-pointer hover:bg-gray-50"
      disabled={currentPage === totalPages}
    >
      Next
    </button>
  </div>
  <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
    <div>
      <p class="text-sm text-gray-700">
        Showing
        <span class="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
        to
        <span class="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span>
        of
        <span class="font-medium">{totalItems}</span>
        results
      </p>
    </div>
    <div>
      <nav class="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
        <button
          onclick={handlePrevious}
          class="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:cursor-pointer hover:bg-gray-50"
          disabled={currentPage === 1}
        >
          Previous
        </button>
        {#each Array(totalPages) as _, i}
          <button onclick={() => handleGoToPage(i + 1)} class="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium {currentClass(i + 1)}">
            {i + 1}
          </button>
        {/each}
        <button
          onclick={handleNext}
          class="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:cursor-pointer hover:bg-gray-50"
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </nav>
    </div>
  </div>
</div>
