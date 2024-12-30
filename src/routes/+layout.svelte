<script lang="ts">
	import '$styles/app.css';
	let { children } = $props();
</script>

<div class="container">
	{@render children()}
</div>
