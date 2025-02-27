import type { FileItem, FilterState, SortConfig, CollectionItem } from "$lib/ts/types";

export class FilterStore {
  currentPage = $state(1);
  readonly itemsPerPage = 20;
  searchQuery = $state("");

  filters: FilterState = $state({
    type: "all"
  });

  sortConfig: SortConfig = $state({
    key: "uploadDate",
    direction: "desc"
  });

  setSearchQuery(query: string) {
    this.searchQuery = query;
  }

  setTypeFilter(type: FilterState["type"]) {
    this.filters = {
      ...this.filters,
      type
    };
    this.currentPage = 1;
  }

  setSortConfig(config: SortConfig) {
    this.sortConfig = config;
  }

  setPage(page: number) {
    this.currentPage = page;
  }

  filterFiles(files: FileItem[]): FileItem[] {
    return files.filter((file) => {
      const matchesType =
        this.filters.type === "all" || (file.type && file.type === this.filters.type);
      const matchesSearch =
        !this.searchQuery || file.name.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }

  getTotalPages(files: FileItem[]): number {
    const filteredFiles = this.filterFiles(files);
    return Math.ceil(filteredFiles.length / this.itemsPerPage);
  }

  getPaginatedFiles(files: FileItem[]): FileItem[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return files.slice(startIndex, startIndex + this.itemsPerPage);
  }

  sortItems<T extends FileItem | CollectionItem>(items: T[]): T[] {
    return [...items].sort((a, b) => {
      if (this.sortConfig.key === "uploadDate" && "uploadDate" in a && "uploadDate" in b) {
        const dateA = new Date(a.uploadDate).getTime();
        const dateB = new Date(b.uploadDate).getTime();
        return this.sortConfig.direction === "desc" ? dateB - dateA : dateA - dateB;
      }

      if (
        this.sortConfig.key === "totalSizeBytes" &&
        "totalSizeBytes" in a &&
        "totalSizeBytes" in b
      ) {
        return this.sortConfig.direction === "desc"
          ? a.totalSizeBytes - b.totalSizeBytes
          : b.totalSizeBytes - a.totalSizeBytes;
      }

      if (this.sortConfig.key === "filesCount" && "filesCount" in a && "filesCount" in b) {
        return this.sortConfig.direction === "desc"
          ? a.filesCount - b.filesCount
          : b.filesCount - a.filesCount;
      }

      if (this.sortConfig.key === "name") {
        return this.sortConfig.direction === "desc"
          ? a.name.toLowerCase().localeCompare(b.name.toLowerCase())
          : b.name.toLowerCase().localeCompare(a.name.toLowerCase());
      }

      if (this.sortConfig.key === "sizeInBytes" && "sizeInBytes" in a && "sizeInBytes" in b) {
        return this.sortConfig.direction === "desc"
          ? a.sizeInBytes - b.sizeInBytes
          : b.sizeInBytes - a.sizeInBytes;
      }

      if (this.sortConfig.key === "type" && "type" in a && "type" in b) {
        return this.sortConfig.direction === "desc"
          ? (a.type || "").localeCompare(b.type || "")
          : (b.type || "").localeCompare(a.type || "");
      }

      if (this.sortConfig.key in a && this.sortConfig.key in b) {
        const direction = this.sortConfig.direction === "desc" ? 1 : -1;
        const valueA = a[this.sortConfig.key as keyof T];
        const valueB = b[this.sortConfig.key as keyof T];
        return direction * String(valueA).localeCompare(String(valueB));
      }

      return 0;
    });
  }

  sortFiles(files: FileItem[]): FileItem[] {
    return this.sortItems(files);
  }
}
