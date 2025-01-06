<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { FileItem } from '$lib/types/file';

    let { file = $bindable() } = $props<{
        file: FileItem;
    }>();

    const dispatch = createEventDispatcher<{
        moderate: { id: number, status: 'Approved' | 'Rejected' };
        pin: number;
    }>();

    function handleModerate(status: 'Approved' | 'Rejected') {
        dispatch('moderate', { id: file.id, status });
    }

    function handlePin() {
        dispatch('pin', file.id);
    }
</script>

<div class="flex items-center gap-3 justify-end">
    <button
        on:click|stopPropagation={() => handleModerate('Approved')}
        class="text-green-600 hover:text-green-900"
        disabled={file.status === 'Approved'}
    >
        ✓
    </button>
    <button
        on:click|stopPropagation={() => handleModerate('Rejected')}
        class="text-red-600 hover:text-red-900"
        disabled={file.status === 'Rejected'}
    >
        ✗
    </button>
    <button
        on:click|stopPropagation={handlePin}
        class="hover:text-blue-900 transition-colors"
        class:text-blue-600={file.isPinned}
        class:text-gray-400={!file.isPinned}
    >
        📌
    </button>
</div>
