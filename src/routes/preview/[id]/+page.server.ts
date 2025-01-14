import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { getStoredFile } from "$lib/stores/filePreviewStore";

export const load: PageServerLoad = async ({ params }) => {
  const file = getStoredFile(params.id);

  if (!file) {
    throw error(404, "File not found");
  }

  // Create a URL for the file blob
  const url = URL.createObjectURL(file.blob);

  return {
    file: {
      id: params.id,
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 
            file.type.startsWith('video/') ? 'video' : 
            'other',
      url
    }
  };
};
