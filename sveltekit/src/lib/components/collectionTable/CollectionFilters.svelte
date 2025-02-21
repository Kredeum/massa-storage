<script lang="ts">
  import type { StatusType, CollectionFilterState } from "$lib/ts/types";
  import { STATUS_APPROVED, STATUS_PENDING, STATUS_REJECTED } from "@kredeum/massa-storage-common/src/constants";

  let {
    filters,
    onStatusFilter
  }: {
    filters: CollectionFilterState;
    onStatusFilter: (value: StatusType | "all") => void;
  } = $props();

  function handleStatusFilterChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value as StatusType | "all";
    onStatusFilter(value);
  }
</script>

<div class="flex flex-col space-y-4">
  <div class="flex items-center space-x-4">
    <select class="rounded-md border border-gray-300 px-3 py-1.5 text-sm" onchange={handleStatusFilterChange} value={filters.status}>
      <option value="all">All Status</option>
      <option value={STATUS_APPROVED}>Approved</option>
      <option value={STATUS_PENDING}>Pending</option>
      <option value={STATUS_REJECTED}>Rejected</option>
    </select>
  </div>
</div>
