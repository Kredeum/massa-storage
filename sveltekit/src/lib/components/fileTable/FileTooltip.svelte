<script lang="ts">
  let { content = "" } = $props<{
    content: string;
  }>();

  let tooltipElement: HTMLDivElement;
  let visible = $state(false);

  export function show(e: MouseEvent) {
    visible = true;
    updatePosition(e);
  }

  export function hide() {
    visible = false;
    if (tooltipElement) {
      tooltipElement.style.display = "none";
    }
  }

  function updatePosition(e: MouseEvent) {
    if (tooltipElement) {
      const rect = tooltipElement.getBoundingClientRect();
      const offset = 10;

      let top = e.clientY - rect.height - offset;
      let left = e.clientX - rect.width / 2;

      if (top < 0) top = e.clientY + offset;
      if (left < 0) left = offset;
      if (left + rect.width > window.innerWidth) {
        left = window.innerWidth - rect.width - offset;
      }

      tooltipElement.style.top = `${top}px`;
      tooltipElement.style.left = `${left}px`;
      tooltipElement.style.display = visible ? "block" : "none";
    }
  }
</script>

<div bind:this={tooltipElement} class="pointer-events-none fixed rounded border-none bg-gray-700 p-2 text-sm text-white" style="display: none; z-index: 9999;">
  {content}
</div>
