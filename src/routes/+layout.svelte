<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/Header.svelte';
	import '$styles/app.css';
	import '$styles/global.css';
	import '$styles/toast.css';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	let { children } = $props();
</script>

<SvelteToast />


<div class="container">
  <Header />

  {@render children()}

	<Footer />
</div>
