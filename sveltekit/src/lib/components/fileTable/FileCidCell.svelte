<script lang="ts">
  let { cid, fileName, onTooltipShow, onTooltipHide } = $props<{
    cid: string;
    fileName: string;
    onTooltipShow: (content: string, event: MouseEvent) => void;
    onTooltipHide: () => void;
  }>();

  function getDisplayCid() {
    return cid ? `${cid.slice(0, 4)}...${cid.slice(-4)}` : "";
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
