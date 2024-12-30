<!-- +page.svelte -->
<script lang="ts">
	import Counter from '$lib/components/Counter.svelte';
</script>

<main>
	<div class="grid">
		<Counter />
	</div>
</main>

<style>
	.container {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	main {
		padding: 5rem 0;
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.grid {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		max-width: 800px;
	}

	@media (max-width: 600px) {
		.grid {
			width: 100%;
			flex-direction: column;
		}
	}
</style>
