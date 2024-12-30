<!-- Footer.svelte -->
<footer>
  <span>© 2024 Massa Counter</span>
  <a
    href="https://massa.net/"
    target="_blank"
    rel="noopener noreferrer"
  >
    <img src="/logo_massa.svg" alt="Massa Logo" />
  </a>
</footer>

<style>
  footer {
    width: 100%;
    height: 100px;
    border-top: 1px solid #eaeaea;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 3em;
  }

  footer img {
    width: 5em;
    height: 5em;
  }

  footer span {
    font-size: 0.8em;
  }

  footer a {
    display: flex;
    justify-content: center;
    align-items: center;
    text-decoration: none;
    color: inherit;
  }
</style>
