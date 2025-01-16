import { writable } from "svelte/store";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration?: number;
}

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);
  let counter = 0;

  return {
    subscribe,
    add: (message: string, type: ToastType = "info", duration: number = 3000) => {
      const id = counter++;
      const toast = { id, message, type, duration };

      update((toasts) => [...toasts, toast]);

      if (duration > 0) {
        setTimeout(() => {
          update((toasts) => toasts.filter((t) => t.id !== id));
        }, duration);
      }
    },
    remove: (id: number) => {
      update((toasts) => toasts.filter((t) => t.id !== id));
    },
    error: (message: string, duration: number = 5000) => {
      toastStore.add(message, "error", duration);
    },
    success: (message: string, duration: number = 3000) => {
      toastStore.add(message, "success", duration);
    },
    info: (message: string, duration: number = 3000) => {
      toastStore.add(message, "info", duration);
    }
  };
}

export const toastStore = createToastStore();
