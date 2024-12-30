<!-- +error.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="error-container">
	<h1>Error</h1>
	<p>{$page.error?.message || 'Something went wrong'}</p>
	{#if $page.error instanceof Error && import.meta.env.DEV}
		<pre class="error-stack">{$page.error.message}</pre>
	{/if}
</div>

<style>
	.error-container {
		max-width: 800px;
		margin: 2rem auto;
		padding: 2rem;
		text-align: center;
	}

	h1 {
		color: #e74c3c;
	}

	.error-stack {
		margin-top: 1rem;
		padding: 1rem;
		background: #f8f9fa;
		border-radius: 4px;
		text-align: left;
		white-space: pre-wrap;
		word-wrap: break-word;
	}
</style>
