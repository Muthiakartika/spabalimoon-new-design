import { denyUnlessAdmin } from "@/lib/blog/session";
import { STORAGE_MISSING } from "@/lib/blog/setup";
import { isStorageConfigured, putImage } from "@/lib/blog/storage";

const MAX_BYTES = 5 * 1024 * 1024;

// Photos only. SVG is left out on purpose: it can carry script.
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

/**
 * POST — upload one image to Cloudflare R2 (folder blog/) and answer with its
 * public URL. The body is the raw file; the headers carry its type
 * (Content-Type) and original name (x-filename, URI-encoded).
 */
export async function POST(request: Request) {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  if (!isStorageConfigured()) return Response.json({ error: STORAGE_MISSING }, { status: 503 });

  const contentType = (request.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  const ext = EXTENSIONS[contentType];
  if (!ext) return Response.json({ error: "File must be a JPG, PNG, WebP, GIF or AVIF image." }, { status: 400 });
  if (Number(request.headers.get("content-length") || 0) > MAX_BYTES) {
    return Response.json({ error: "Image must be 5MB or smaller." }, { status: 400 });
  }

  const body = new Uint8Array(await request.arrayBuffer());
  if (!body.length) return Response.json({ error: "File is empty." }, { status: 400 });
  if (body.length > MAX_BYTES) return Response.json({ error: "Image must be 5MB or smaller." }, { status: 400 });

  // A safe, unique key: blog/<timestamp>-<name>.<ext>
  let rawName = request.headers.get("x-filename") || "image";
  try {
    rawName = decodeURIComponent(rawName);
  } catch {
    // Not encoded: use it as it came.
  }
  const safeName =
    rawName
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-z0-9-_]/gi, "-")
      .toLowerCase()
      .slice(0, 40) || "image";
  const key = `blog/${Date.now()}-${safeName}.${ext}`;

  try {
    return Response.json({ url: await putImage(key, body, contentType), path: key });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Upload failed." }, { status: 500 });
  }
}
