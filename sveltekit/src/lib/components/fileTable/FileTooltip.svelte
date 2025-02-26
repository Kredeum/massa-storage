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
      const targetRect = (e.target as HTMLElement).getBoundingClientRect();
      const offset = 10;

      // Position le tooltip au-dessus du texte
      const top = targetRect.top - rect.height - offset;
      // Centre le tooltip horizontalement par rapport au texte
      const left = targetRect.left + (targetRect.width - rect.width) / 2;

      tooltipElement.style.top = `${top}px`;
      tooltipElement.style.left = `${left}px`;
      tooltipElement.style.display = visible ? "block" : "none";
    }
  }
</script>

<div bind:this={tooltipElement} class="pointer-events-none fixed rounded border-none bg-gray-700 p-2 text-sm text-white" style="display: none; z-index: 9999;">
  {content}
</div>
