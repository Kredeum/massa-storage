import type { FileItem, FilterState, SortConfig } from "$lib/ts/types";

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

  sortFiles(files: FileItem[]): FileItem[] {
    return [...files].sort((a, b) => {
      if (this.sortConfig.key === "uploadDate") {
        const dateA = new Date(a.uploadDate).getTime();
        const dateB = new Date(b.uploadDate).getTime();
        return this.sortConfig.direction === "desc" ? dateB - dateA : dateA - dateB;
      }

      if (this.sortConfig.key === "name") {
        return this.sortConfig.direction === "asc"
          ? (b.name ? b.name.toLowerCase() : "").localeCompare(a.name ? a.name.toLowerCase() : "")
          : (a.name ? a.name.toLowerCase() : "").localeCompare(b.name ? b.name.toLowerCase() : "");
      }

      if (this.sortConfig.key === "sizeInBytes") {
        return this.sortConfig.direction === "asc"
          ? b.sizeInBytes - a.sizeInBytes
          : a.sizeInBytes - b.sizeInBytes;
      }

      const direction = this.sortConfig.direction === "desc" ? 1 : -1;
      return (
        direction * String(a[this.sortConfig.key]).localeCompare(String(b[this.sortConfig.key]))
      );
    });
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
