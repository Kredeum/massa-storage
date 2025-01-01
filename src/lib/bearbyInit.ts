import { onMount } from 'svelte';

export function initBearby(): Promise<Bearby> {
  return new Promise((resolve) => {
    const checkBearby = () => {
      if ('bearby' in window && window.bearby?.wallet) {
        resolve(window.bearby);
      } else {
        setTimeout(checkBearby, 100);
      }
    };

    checkBearby();
  });
}
