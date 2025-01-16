import { writable } from "svelte/store";

type PreviewFile = {
  blob: Blob;
  name: string;
  type: string;
};

// Create a store to hold preview files
const fileStore = new Map<string, PreviewFile>();

// Export functions to interact with the store
export function storeFileForPreview(id: string, file: PreviewFile) {
  fileStore.set(id, file);
}

export function getStoredFile(id: string): PreviewFile | undefined {
  return fileStore.get(id);
}

export function removeStoredFile(id: string) {
  fileStore.delete(id);
}
