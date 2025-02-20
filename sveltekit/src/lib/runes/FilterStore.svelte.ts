import type { FileItem, FilterState, SortConfig, CollectionItem } from "$lib/ts/types";

export class FilterStore {
  currentPage = $state(0);
  readonly itemsPerPage = 20;
  searchQuery = $state("");

  filters: FilterState = $state({
    type: "all",
    status: "all",
    tags: []
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
    this.currentPage = 0;
  }

  setStatusFilter(status: FilterState["status"]) {
    this.filters = {
      ...this.filters,
      status
    };
    this.currentPage = 0;
  }

  setSortConfig(config: SortConfig) {
    this.sortConfig = config;
  }

  setPage(page: number) {
    this.currentPage = page;
  }

  filterFiles(files: FileItem[]): FileItem[] {
    return files.filter((file) => {
      const matchesType = this.filters.type === "all" || file.type === this.filters.type;
      const matchesStatus = this.filters.status === "all" || file.status === this.filters.status;
      const matchesTags =
        this.filters.tags.length === 0 ||
        (file.tags && file.tags.some((tag) => this.filters.tags.includes(tag)));
      const matchesSearch =
        !this.searchQuery || file.name.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesType && matchesStatus && matchesTags && matchesSearch;
    });
  }

  sortItems<T extends FileItem | CollectionItem>(items: T[]): T[] {
    return [...items].sort((a, b) => {
      if (this.sortConfig.key === "uploadDate" && "uploadDate" in a && "uploadDate" in b) {
        const dateA = new Date(a.uploadDate).getTime();
        const dateB = new Date(b.uploadDate).getTime();
        return this.sortConfig.direction === "desc" ? dateB - dateA : dateA - dateB;
      }

      if (this.sortConfig.key === "name") {
        return this.sortConfig.direction === "asc"
          ? (b.name ? b.name.toLowerCase() : "").localeCompare(a.name ? a.name.toLowerCase() : "")
          : (a.name ? a.name.toLowerCase() : "").localeCompare(b.name ? b.name.toLowerCase() : "");
      }

      if (this.sortConfig.key === "sizeInBytes" && "sizeInBytes" in a && "sizeInBytes" in b) {
        return this.sortConfig.direction === "asc"
          ? b.sizeInBytes - a.sizeInBytes
          : a.sizeInBytes - b.sizeInBytes;
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

  getPaginatedFiles(files: FileItem[]): FileItem[] {
    const filteredFiles = this.filterFiles(files);
    const sortedFiles = this.sortFiles(filteredFiles);
    return sortedFiles.slice(
      this.currentPage * this.itemsPerPage,
      (this.currentPage + 1) * this.itemsPerPage
    );
  }

  getTotalPages(files: FileItem[]): number {
    return Math.ceil(this.filterFiles(files).length / this.itemsPerPage);
  }
}
