import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getStoredFile } from '$lib/stores/filePreviewStore';

export const GET: RequestHandler = async ({ params }) => {
  const file = getStoredFile(params.id);
  
  if (!file) {
    throw error(404, 'File not found');
  }

  // Convert Blob to ArrayBuffer
  const arrayBuffer = await file.blob.arrayBuffer();

  return new Response(arrayBuffer, {
    headers: {
      'Content-Type': file.type,
      'Content-Disposition': `inline; filename="${file.name}"`,
      'Cache-Control': 'no-cache'
    }
  });
};
