/**
 * Production-grade secure logger that automatically scrubs
 * sensitive credentials (passwords, tokens, secrets, hashes, keys)
 * to ensure sensitive customer and admin data never leaks into logs.
 */

const SENSITIVE_PATTERN = /password|token|secret|authorization|cookie|session|apikey|key|hash/i;

export function sanitizeSensitive<T>(value: T): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (value instanceof Error) {
    const isProd = process.env.NODE_ENV === 'production';
    const errObj = value as Error & { code?: string | number };
    return {
      name: errObj.name,
      message: errObj.message,
      code: errObj.code,
      ...(isProd ? {} : { stack: errObj.stack }),
    };
  }

  if (typeof value === 'string') {
    // Scrub URL parameters or raw strings containing secrets
    return value.replace(
      /(password|token|secret|key|authorization|hash)=([^\s&]+)/gi,
      '$1=***'
    );
  }

  if (typeof value === 'object') {
    try {
      const isProd = process.env.NODE_ENV === 'production';
      const serialized = JSON.stringify(value, (k, v) => {
        if (v instanceof Error) {
          const errObj = v as Error & { code?: string | number };
          return {
            name: errObj.name,
            message: errObj.message,
            code: errObj.code,
            ...(isProd ? {} : { stack: errObj.stack }),
          };
        }
        if (k && SENSITIVE_PATTERN.test(k)) {
          return '***';
        }
        return v;
      });
      // Second regex scrub for edge cases
      return JSON.parse(
        serialized.replace(
          /"(password|token|secret|passwordHash|authToken|apiKey|authorization)"\s*:\s*"[^"]*"/gi,
          '"$1":"***"'
        )
      );
    } catch {
      return '[Unserializable Object]';
    }
  }

  return value;
}

export const logger = {
  info: (message: string, ...args: unknown[]) => {
    const sanitized = args.map(sanitizeSensitive);
    console.log(`[INFO] ${message}`, ...sanitized);
  },
  warn: (message: string, ...args: unknown[]) => {
    const sanitized = args.map(sanitizeSensitive);
    console.warn(`[WARN] ${message}`, ...sanitized);
  },
  error: (message: string, ...args: unknown[]) => {
    const sanitized = args.map(sanitizeSensitive);
    console.error(`[ERROR] ${message}`, ...sanitized);
  },
};
