<script lang="ts">
    import { writable, type Writable } from 'svelte/store';
    import type { FileItem, FilterState, SortConfig } from '$lib/types/file';

    // Fonction pour obtenir l'icône selon le type
    function getFileIcon(type: string): string {
        switch (type) {
            case 'document':
                return '📄';
            case 'image':
                return '🖼️';
            case 'video':
                return '🎥';
            case 'sound':
                return '🎵';
            default:
                return '📁';
        }
    }

    // Fonction pour générer des données aléatoires
    function generateMockData(count: number): FileItem[] {
        const types = ['document', 'image', 'video', 'sound'] as const;
        const statuses = ['Pending', 'Approved', 'Rejected'] as const;
        const extensions = {
            document: '.pdf',
            image: ['.jpg', '.png', '.gif'],
            video: ['.mp4', '.mov', '.avi'],
            sound: ['.mp3', '.wav', '.ogg']
        };

        return Array.from({ length: count }, (_, i) => {
            const type = types[Math.floor(Math.random() * types.length)];
            const ext = Array.isArray(extensions[type])
                ? extensions[type][Math.floor(Math.random() * extensions[type].length)]
                : extensions[type];
            
            return {
                id: i + 1,
                name: `File ${i + 1}${ext}`,
                size: `${Math.floor(Math.random() * 100)}.${Math.floor(Math.random() * 9)}MB`,
                type,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                isPinned: Math.random() > 0.8,
                lastModified: new Date(2024, 0, Math.floor(Math.random() * 31) + 1).toISOString().split('T')[0]
            };
        });
    }

    // Pagination
    let currentPage = 0;
    const itemsPerPage = 10;
    const totalItems = 100;

    const files = writable<FileItem[]>(generateMockData(totalItems));
    
    // Stores pour les filtres et le tri
    const filters = writable<FilterState>({
        type: 'all',
        status: 'all'
    });

    const sortConfig = writable<SortConfig>({
        key: 'name',
        direction: 'asc'
    });

    const selectedFiles = writable<number[]>([]);
    const searchQuery = writable('');

    // Computed pour les fichiers filtrés et triés
    $: filteredFiles = $files.filter(file => {
        const typeMatch = $filters.type === 'all' || file.type === $filters.type;
        const statusMatch = $filters.status === 'all' || file.status === $filters.status;
        const searchMatch = file.name.toLowerCase().includes($searchQuery.toLowerCase());
        return typeMatch && statusMatch && searchMatch;
    });

    $: sortedFiles = [...filteredFiles].sort((a, b) => {
        const aValue = a[$sortConfig.key];
        const bValue = b[$sortConfig.key];
        const direction = $sortConfig.direction === 'asc' ? 1 : -1;
        return aValue < bValue ? -1 * direction : aValue > bValue ? 1 * direction : 0;
    });

    // Pagination des fichiers
    $: paginatedFiles = sortedFiles.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    );

    $: totalPages = Math.ceil(sortedFiles.length / itemsPerPage);

    function nextPage() {
        if (currentPage < totalPages - 1) currentPage++;
    }

    function previousPage() {
        if (currentPage > 0) currentPage--;
    }

    function goToPage(page: number) {
        if (page >= 0 && page < totalPages) {
            currentPage = page;
        }
    }

    function handleSort(key: keyof FileItem) {
        $sortConfig = {
            key,
            direction: $sortConfig.key === key && $sortConfig.direction === 'asc' ? 'desc' : 'asc'
        };
    }

    function handleCheckbox(fileId: number) {
        $selectedFiles = $selectedFiles.includes(fileId)
            ? $selectedFiles.filter(id => id !== fileId)
            : [...$selectedFiles, fileId];
    }

    function handlePin(fileId: number) {
        $files = $files.map(file =>
            file.id === fileId ? { ...file, isPinned: !file.isPinned } : file
        );
    }

    function handleModeration(fileId: number, newStatus: FileItem['status']) {
        $files = $files.map(file =>
            file.id === fileId ? { ...file, status: newStatus } : file
        );
    }
</script>

<div class="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
    <div class="mb-6 space-y-4">
        <div class="flex items-center justify-between">
            <div class="relative flex-1 max-w-md">
                <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                <input
                    type="text"
                    placeholder="Search files..."
                    class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    bind:value={$searchQuery}
                />
            </div>
            <div class="flex space-x-4">
                <select
                    class="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    bind:value={$filters.type}
                >
                    <option value="all">All Types</option>
                    <option value="document">Document</option>
                    <option value="image">Image</option>
                    <option value="sound">Sound</option>
                    <option value="video">Video</option>
                </select>
                <select
                    class="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    bind:value={$filters.status}
                >
                    <option value="all">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                </select>
            </div>
        </div>
    </div>

    <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                            type="checkbox"
                            class="rounded text-blue-600"
                            checked={$selectedFiles.length === paginatedFiles.length}
                            on:change={() => {
                                if ($selectedFiles.length === paginatedFiles.length) {
                                    $selectedFiles = [];
                                } else {
                                    $selectedFiles = paginatedFiles.map(f => f.id);
                                }
                            }}
                        />
                    </th>
                    {#each ['name', 'size', 'type'] as column}
                        <th
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            on:click={() => handleSort(column as keyof FileItem)}
                        >
                            <div class="flex items-center gap-2">
                                {column}
                                <span class="text-gray-400">↓</span>
                            </div>
                        </th>
                    {/each}
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                    </th>
                    <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center w-32">
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                {#each paginatedFiles as file}
                    <tr 
                        class="hover:bg-gray-50 cursor-pointer"
                        on:click={() => {
                            if ($selectedFiles.includes(file.id)) {
                                $selectedFiles = $selectedFiles.filter(id => id !== file.id);
                            } else {
                                $selectedFiles = [...$selectedFiles, file.id];
                            }
                        }}
                    >
                        <td class="px-6 py-4 whitespace-nowrap">
                            <input
                                type="checkbox"
                                class="rounded text-blue-600"
                                checked={$selectedFiles.includes(file.id)}
                                on:click|stopPropagation
                                on:change={() => {
                                    if ($selectedFiles.includes(file.id)) {
                                        $selectedFiles = $selectedFiles.filter(id => id !== file.id);
                                    } else {
                                        $selectedFiles = [...$selectedFiles, file.id];
                                    }
                                }}
                            />
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center gap-2">
                                <span>{getFileIcon(file.type)}</span>
                                <span>{file.name}</span>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">{file.size}</td>
                        <td class="px-6 py-4 whitespace-nowrap">{file.type}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                ${file.status === 'Approved' ? 'bg-green-100 text-green-800' : ''}
                                ${file.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                                ${file.status === 'Rejected' ? 'bg-red-100 text-red-800' : ''}`}>
                                {file.status}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center justify-center gap-4 w-32">
                                <button
                                    on:click|stopPropagation={() => handleModeration(file.id, 'Approved')}
                                    class="text-green-600 hover:text-green-900 w-4 flex justify-center"
                                    disabled={file.status === 'Approved'}
                                >
                                    ✓
                                </button>
                                <button
                                    on:click|stopPropagation={() => handleModeration(file.id, 'Rejected')}
                                    class="text-red-600 hover:text-red-900 w-4 flex justify-center"
                                    disabled={file.status === 'Rejected'}
                                >
                                    ✗
                                </button>
                                <button
                                    on:click|stopPropagation={() => handlePin(file.id)}
                                    class="hover:text-blue-900 transition-colors w-4 flex justify-center"
                                    class:text-blue-600={file.isPinned}
                                    class:text-gray-400={!file.isPinned}
                                >
                                    📌
                                </button>
                            </div>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    <!-- Pagination -->
    <div class="mt-4 flex items-center justify-between">
        <div class="flex-1 flex justify-between sm:hidden">
            <button
                on:click={previousPage}
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                disabled={currentPage === 0}
            >
                Previous
            </button>
            <button
                on:click={nextPage}
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
                    <span class="font-medium">{Math.min((currentPage + 1) * itemsPerPage, sortedFiles.length)}</span>
                    of
                    <span class="font-medium">{sortedFiles.length}</span>
                    results
                </p>
            </div>
            <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                        on:click={previousPage}
                        class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        disabled={currentPage === 0}
                    >
                        Previous
                    </button>
                    {#each Array(totalPages) as _, i}
                        <button
                            on:click={() => goToPage(i)}
                            class={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium
                                ${currentPage === i ? 'bg-blue-50 border-blue-500 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                            {i + 1}
                        </button>
                    {/each}
                    <button
                        on:click={nextPage}
                        class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        disabled={currentPage === totalPages - 1}
                    >
                        Next
                    </button>
                </nav>
            </div>
        </div>
    </div>
</div>
