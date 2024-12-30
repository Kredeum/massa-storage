<!-- +page.svelte -->
<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Counter from '$lib/components/Counter.svelte';
  import Footer from '$lib/components/Footer.svelte';
</script>

<div class="container">
  <Header />

  <main>
    <div class="grid">
      <Counter />
    </div>
  </main>

  <Footer />
</div>

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