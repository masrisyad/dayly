/** Saves a file through a temporary download link. */
export function downloadFile(file: File): void {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export const canShareFile = (file: File): boolean => typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });

/** Opens the system share sheet. Resolves false if the user closed it. */
export async function shareFile(file: File): Promise<boolean> {
  try {
    await navigator.share({ files: [file] });
    return true;
  } catch (e) {
    if ((e as Error).name === 'AbortError') return false;
    throw e;
  }
}
