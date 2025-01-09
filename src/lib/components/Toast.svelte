<!-- Toast.svelte -->
<script lang="ts">
  import { toastStore, type Toast } from "../stores/toast";

  $: toasts = $toastStore;

  function handleKeyDown(event: KeyboardEvent, toast: Toast) {
    if (event.key === "Enter" || event.key === " ") {
      toastStore.remove(toast.id);
    }
  }
</script>

<div class="toast-container">
  {#each toasts as toast (toast.id)}
    <div class="toast-wrapper" role="alert">
      <button
        class="toast"
        class:error={toast.type === "error"}
        class:success={toast.type === "success"}
        class:info={toast.type === "info"}
        on:click={() => toastStore.remove(toast.id)}
        on:keydown={(e) => handleKeyDown(e, toast)}
        type="button"
        aria-label="Fermer la notification"
      >
        <p>{toast.message}</p>
      </button>
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    top: 0.75rem;
    right: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    z-index: 1000;
  }

  .toast-wrapper {
    width: 100%;
  }

  .toast {
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    color: white;
    min-width: 180px;
    max-width: 320px;
    animation: slideIn 0.2s ease-out;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    border: none;
    text-align: left;
    cursor: pointer;
    width: 100%;
    font-size: 0.875rem;
    transition: all 0.2s ease;
  }

  .toast p {
    margin: 0;
  }

  .error {
    background-color: rgba(239, 68, 68, 0.9);
    border-left: 4px solid rgb(220, 38, 38);
  }

  .success {
    background-color: rgba(34, 197, 94, 0.9);
    border-left: 4px solid rgb(22, 163, 74);
  }

  .info {
    background-color: rgba(59, 130, 246, 0.9);
    border-left: 4px solid rgb(37, 99, 235);
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .toast:hover {
    opacity: 1;
    transform: translateY(-1px);
    box-shadow: 0 6px 8px -2px rgb(0 0 0 / 0.15);
  }

  .toast:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.4);
  }
</style>
