<!-- Header.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
</script>

<header>
  <div class="header-content">
    <h1>Massa Counter</h1>
    <p>A simple counter DApp on Massa blockchain</p>
  </div>
</header>

<style>
  header {
    width: 100%;
    padding: 2rem 0;
    background-color: #fafafa;
    border-bottom: 1px solid #eaeaea;
  }

  .header-content {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
  }

  h1 {
    margin: 0;
    font-size: 2.5rem;
    color: #0070f3;
  }

  p {
    margin: 1rem 0 0;
    font-size: 1.25rem;
    color: #666;
  }
</style>
