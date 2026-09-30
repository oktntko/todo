export function bytesToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = Object.assign(new FileReader(), {
      onload: () => resolve(reader.result as string),
      onerror: () => reject(reader.error),
    });
    reader.readAsDataURL(file);
  });
}

export async function saveAsFile(blob: Blob, contentDisposition: string | null) {
  const headerFilename = contentDisposition?.split('filename=')[1] ?? 'download';
  const filename = decodeURIComponent(headerFilename).replace(/\+/g, ' ');

  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.setAttribute('download', filename);
  link.click();
  URL.revokeObjectURL(href);
}
