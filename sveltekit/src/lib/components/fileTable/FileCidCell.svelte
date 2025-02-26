<script lang="ts">
  import ShortenedTextTooltip from "$lib/components/common/ShortenedTextTooltip.svelte";

  let { cid, fileName } = $props<{
    cid: string;
    fileName: string;
  }>();
</script>

<td class="w-1/6 px-4 py-4 text-center text-sm">
  <ShortenedTextTooltip text={cid} label={`CID for ${fileName}`} />
</td>
