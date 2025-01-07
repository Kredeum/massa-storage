<script lang="ts">
    export let currentPage: number;
    export let totalPages: number;
    export let itemsPerPage: number;
    export let totalItems: number;
    export let setPage: (page: number) => void;

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
</script>

<div class="mt-4 flex items-center justify-between">
    <div class="flex-1 flex justify-between sm:hidden">
        <button
            on:click={handlePrevious}
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            disabled={currentPage === 0}
        >
            Previous
        </button>
        <button
            on:click={handleNext}
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            disabled={currentPage === totalPages - 1}
        >
            Next
        </button>
    </div>
    <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
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
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                    on:click={handlePrevious}
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    disabled={currentPage === 0}
                >
                    Previous
                </button>
                {#each Array(totalPages) as _, i}
                    <button
                        on:click={() => handleGoToPage(i)}
                        class={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium
                            ${currentPage === i ? 'bg-blue-50 border-blue-500 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                        {i + 1}
                    </button>
                {/each}
                <button
                    on:click={handleNext}
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    disabled={currentPage === totalPages - 1}
                >
                    Next
                </button>
            </nav>
        </div>
    </div>
</div>
