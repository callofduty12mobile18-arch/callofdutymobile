/**
 * Cryptographic session signing and verification using Web Crypto API (HMAC-SHA256).
 * Compatible with Next.js Edge Runtime (Middleware) and Node.js Server Action runtime.
 */

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  process.env.AUTH_SECRET ||
  'codm-esports-india-secure-secret-key-391840192840129';

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getCryptoKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(SESSION_SECRET);
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Signs a JSON-serializable session payload and returns a tamper-proof string:
 * `base64url(payload).base64url(signature)`
 */
export async function signSession<T>(payload: T): Promise<string> {
  const encoder = new TextEncoder();
  const jsonString = JSON.stringify(payload);
  const payloadBytes = encoder.encode(jsonString);
  const payloadB64 = base64UrlEncode(payloadBytes);

  const key = await getCryptoKey();
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadB64));
  const signatureB64 = base64UrlEncode(new Uint8Array(signatureBuffer));

  return `${payloadB64}.${signatureB64}`;
}

/**
 * Verifies a signed session token. Returns the decoded payload if the HMAC signature matches, or null if forged/expired/invalid.
 */
export async function verifySession<T>(token: string): Promise<T | null> {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, signatureB64] = parts;
  if (!payloadB64 || !signatureB64) return null;

  try {
    const encoder = new TextEncoder();
    const key = await getCryptoKey();
    const signatureBytes = base64UrlDecode(signatureB64);

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes as BufferSource,
      encoder.encode(payloadB64)
    );

    if (!isValid) return null;

    const payloadBytes = base64UrlDecode(payloadB64);
    const decoder = new TextDecoder();
    const jsonString = decoder.decode(payloadBytes);
    return JSON.parse(jsonString) as T;
  } catch (err) {
    return null;
  }
}
