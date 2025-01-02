export function getFileIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'document':
      return '📄';
    case 'image':
      return '🖼️';
    case 'video':
      return '🎥';
    default:
      return '📁';
  }
}

export function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}
