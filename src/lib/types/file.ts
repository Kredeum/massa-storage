export interface FileItem {
    id: number;
    name: string;
    size: string;
    type: 'image' | 'video' | 'sound' | 'document';
    status: 'Pending' | 'Approved' | 'Rejected';
    isPinned: boolean;
    lastModified: string;
}

export interface FilterState {
    type: 'all' | 'image' | 'video' | 'sound' | 'document';
    status: 'all' | 'Pending' | 'Approved' | 'Rejected';
}

export interface SortConfig {
    key: keyof FileItem;
    direction: 'asc' | 'desc';
}
