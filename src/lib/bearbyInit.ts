import { onMount } from 'svelte';

export function initBearby() {
  return new Promise((resolve) => {
    const checkBearby = () => {
      if ('bearby' in window) {
        resolve(window.bearby);
      } else {
        setTimeout(checkBearby, 100);
      }
    };

    checkBearby();
  });
}
