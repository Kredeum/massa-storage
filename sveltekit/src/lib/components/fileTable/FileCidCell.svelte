<script lang="ts">
    import { shortenString } from "$lib/ts/utils";

  let { cid, fileName, onTooltipShow, onTooltipHide } = $props<{
    cid: string;
    fileName: string;
    onTooltipShow: (content: string, event: MouseEvent) => void;
    onTooltipHide: () => void;
  }>();

  function getDisplayCid() {
    return shortenString(cid);
  }

  function handleCopyCid(e: MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(cid);
  }
</script>

<td class="w-1/6 px-4 py-4 text-center text-sm">
  <button
    class="text-gray-500 hover:text-gray-700 focus:outline-none"
    onclick={handleCopyCid}
    onmouseenter={(e) => onTooltipShow(cid, e)}
    onmouseleave={() => {
      onTooltipHide();
    }}
    aria-label={`Copy CID for ${fileName}`}
  >
    {getDisplayCid()}
  </button>
</td>
