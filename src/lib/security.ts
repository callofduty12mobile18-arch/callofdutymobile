/** Escape text for safe interpolation into HTML (element content and quoted attributes). */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Returns a normalized http(s) URL, or null if the input is not a valid http(s) URL. */
export function safeHttpUrl(input: string | null | undefined): string | null {
  const raw = (input ?? '').trim();
  if (!raw || raw.length > 2048) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Accepts /uploads/... files, https URLs, or safe image/video data URIs; rejects everything else. */
export function safeMediaUrl(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const raw = input.trim();
  if (/^\/uploads\/[a-z_]+\/[A-Za-z0-9._-]+$/.test(raw) && !raw.includes('..')) return raw;
  if (/^https?:\/\//i.test(raw)) return safeHttpUrl(raw);
  if (/^data:(image\/(png|jpeg|jpg|webp|gif)|video\/(mp4|webm|quicktime));base64,[A-Za-z0-9+/=]+$/i.test(raw)) return raw;
  return null;
}

/** Serialize JSON for embedding inside a <script> tag without allowing `</script>` breakouts. */
export function jsonForScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
