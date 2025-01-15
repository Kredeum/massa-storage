<script lang="ts">
  interface Props {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
    setPage: (page: number) => void;
  }

  let { currentPage, totalPages, itemsPerPage, totalItems, setPage }: Props = $props();

  function handlePrevious() {
    if (currentPage > 0) {
      setPage(currentPage - 1);
    }
  }

  function handleNext() {
    if (currentPage < totalPages - 1) {
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
      class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      disabled={currentPage === 0}
    >
      Previous
    </button>
    <button
      onclick={handleNext}
      class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      disabled={currentPage === totalPages - 1}
    >
      Next
    </button>
  </div>
  <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
    <div>
      <p class="text-sm text-gray-700">
        Showing
        <span class="font-medium">{currentPage * itemsPerPage + 1}</span>
        to
        <span class="font-medium">{Math.min((currentPage + 1) * itemsPerPage, totalItems)}</span>
        of
        <span class="font-medium">{totalItems}</span>
        results
      </p>
    </div>
    <div>
      <nav class="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
        <button
          onclick={handlePrevious}
          class="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
          disabled={currentPage === 0}
        >
          Previous
        </button>
        {#each Array(totalPages) as _, i}
          <button onclick={() => handleGoToPage(i)} class="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium {currentClass(i)}">
            {i + 1}
          </button>
        {/each}
        <button
          onclick={handleNext}
          class="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
          disabled={currentPage === totalPages - 1}
        >
          Next
        </button>
      </nav>
    </div>
  </div>
</div>
