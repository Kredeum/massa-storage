<script lang="ts">
  import Footer from "$lib/components/Footer.svelte";
  import Header from "$lib/components/Header.svelte";
  import "$styles/toast.css";
  import { Toaster } from "svelte-hot-french-toast";

  let { children } = $props();
</script>

<Toaster />

<Header />

{@render children()}

<Footer />
