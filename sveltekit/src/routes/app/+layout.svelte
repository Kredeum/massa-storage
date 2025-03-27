<script lang="ts">
  import { page } from "$app/state";
  import "$styles/toast.css";
  import { setContext } from "svelte";

  import { Ipfs } from "$lib/runes/ipfs.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Header from "$lib/components/Header.svelte";
  import { PrivateKeyProvider } from "$lib/runes/writer.svelte";

  if (!localStorage.getItem("IPFS_API")) localStorage.setItem("IPFS_API", "http://localhost:5001");

  const key = page.url.searchParams.get("key") || "";

  const ipfs = key ? new Ipfs(new PrivateKeyProvider(key)) : new Ipfs();

  setContext("ipfs", ipfs);

  let { children } = $props();
</script>

<Header client={ipfs} />

{@render children()}

<Footer />
