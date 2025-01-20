<script lang="ts">
  import ModeratorList from "$lib/components/profiles/ModeratorList.svelte";
  import type { ModeratorProfile } from "$lib/types/profile";
  import { TEST_ADDRESSES } from "$lib/config/test-addresses";

  let moderators: ModeratorProfile[] = [
    {
      address: TEST_ADDRESSES.moderator,
      addedAt: new Date("2024-01-15").getTime(),
      active: true
    },
    {
      address: TEST_ADDRESSES.admin,
      addedAt: new Date("2024-01-14").getTime(),
      active: false
    }
  ];
</script>

<div class="container mx-auto py-6">
  <div class="mx-auto max-w-7xl">
    <h1 class="mb-8 text-3xl font-bold text-gray-800">Profile Management</h1>
    <ModeratorList {moderators} />
  </div>
</div>
