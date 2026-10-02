/** Upload one image through /api/admin/upload/ and return its public URL. */
export async function uploadImage(file: File): Promise<string> {
  const res = await fetch("/api/admin/upload/", {
    method: "POST",
    // Encoded: a header may only carry Latin-1, and file names can hold anything.
    headers: { "Content-Type": file.type, "x-filename": encodeURIComponent(file.name) },
    body: file,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
  return data.url as string;
}
