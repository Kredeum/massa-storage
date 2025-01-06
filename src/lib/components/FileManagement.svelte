<script lang="ts">
    import { writable } from 'svelte/store';
    import type { FileItem, FilterState, SortConfig } from '$lib/types/file';
    import SearchBar from './SearchBar.svelte';
    import FileFilters from './FileFilters.svelte';
    import FileTable from './FileTable.svelte';
    import FileActions from './FileActions.svelte';
    import FilePagination from './FilePagination.svelte';

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

    // État global
    let currentPage = 0;
    const itemsPerPage = 10;
    const totalItems = 100;

    let files = generateMockData(totalItems);
    let selectedFiles: number[] = [];
    let searchQuery = '';
    let filters: FilterState = {
        type: 'all',
        status: 'all'
    };
    let sortConfig: SortConfig = {
        key: 'name',
        direction: 'asc'
    };

    // Filtrage et tri réactifs
    $: filteredFiles = files.filter(file => {
        const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filters.type === 'all' || file.type === filters.type;
        const matchesStatus = filters.status === 'all' || file.status === filters.status;
        return matchesSearch && matchesType && matchesStatus;
    });

    $: sortedFiles = [...filteredFiles].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        const direction = sortConfig.direction === 'asc' ? 1 : -1;
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return direction * aValue.localeCompare(bValue);
        }
        return direction * (Number(aValue) - Number(bValue));
    });

    $: paginatedFiles = sortedFiles.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    );

    $: totalPages = Math.ceil(sortedFiles.length / itemsPerPage);

    // Actions
    function handleSort(key: keyof FileItem) {
        sortConfig = {
            key,
            direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
        };
    }

    function handleCheckbox(e: CustomEvent<number>) {
        const fileId = e.detail;
        selectedFiles = selectedFiles.includes(fileId)
            ? selectedFiles.filter(id => id !== fileId)
            : [...selectedFiles, fileId];
    }

    function handlePin(id: number) {
        files = files.map(file =>
            file.id === id ? { ...file, isPinned: !file.isPinned } : file
        );
    }

    function handleModeration(data: { id: number; status: FileItem['status'] }) {
        files = files.map(file =>
            file.id === data.id ? { ...file, status: data.status } : file
        );
    }

    function handleSearchChange(query: string) {
        searchQuery = query;
    }

    function handleFilterChange(e: CustomEvent<{ type: string; value: string }>) {
        const { type, value } = e.detail;
        filters = {
            ...filters,
            [type]: value
        };
    }

    function handleTypeFilter(value: FilterState['type']) {
        filters = {
            ...filters,
            type: value
        };
    }

    function handleSizeFilter(value: string) {
        // Not implemented
    }

    function setPage(page: number) {
        currentPage = page;
    }
</script>

<div class="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
    <div class="mb-6 space-y-4">
        <div class="flex items-center justify-between">
            <SearchBar searchTerm={searchQuery} onSearch={handleSearchChange} />
            <FileFilters 
                filters={filters}
                sortConfig={sortConfig}
                onTypeFilter={handleTypeFilter}
                onSizeFilter={handleSizeFilter}
                onSort={handleSort}
            />
        </div>
    </div>

    <FileTable
        files={paginatedFiles}
        {selectedFiles}
    >
        <svelte:fragment slot="actions" let:file>
            <FileActions 
                {file}
                onModerate={handleModeration}
                onPin={handlePin}
            />
        </svelte:fragment>
    </FileTable>

    <FilePagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={filteredFiles.length}
        setPage={(page) => setPage(page)}
    />
</div>
