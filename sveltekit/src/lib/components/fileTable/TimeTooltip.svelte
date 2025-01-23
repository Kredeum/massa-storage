<script lang="ts">
  let { text = "", tooltip = "" } = $props<{
    text: string;
    tooltip: string;
  }>();
</script>

<div class="group relative cursor-default">
  <span>{text}</span>
  <span class="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-gray-500 opacity-0 transition-opacity group-hover:opacity-100">
    {tooltip}
  </span>
</div>
