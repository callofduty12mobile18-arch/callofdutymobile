import { headers } from 'next/headers';
import { Redis } from '@upstash/redis';

interface Bucket {
  count: number;
  resetAt: number;
}

// In-memory fallback buckets
const buckets = new Map<string, Bucket>();

// Aggressive cleanup interval: every 5 minutes (300,000 ms)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanupTime = Date.now();

// Lazy-initialized Redis instance (supports Upstash Redis and Vercel KV)
let redisClient: Redis | null = null;
let redisInitialized = false;

function getRedisInstance(): Redis | null {
  if (redisInitialized) return redisClient;
  redisInitialized = true;

  const url =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN;

  if (url && token) {
    try {
      redisClient = new Redis({ url, token });
    } catch (err) {
      console.warn('[RATE_LIMIT] Failed to initialize Redis client, falling back to memory:', err);
      redisClient = null;
    }
  }

  return redisClient;
}

/**
 * Purges expired buckets to prevent memory leaks under sustained load.
 */
export function purgeExpiredBuckets(now: number = Date.now()): number {
  let purgedCount = 0;
  for (const [k, b] of buckets.entries()) {
    if (b.resetAt <= now) {
      buckets.delete(k);
      purgedCount += 1;
    }
  }
  lastCleanupTime = now;
  return purgedCount;
}

export async function getClientIp(): Promise<string> {
  try {
    const h = await headers();
    return (
      h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      h.get('x-real-ip') ||
      'unknown'
    );
  } catch {
    return 'unknown';
  }
}

/**
 * Distributed rate limiter with Upstash Redis / Vercel KV support
 * and hardened in-memory fallback with 5-minute cleanup.
 * 
 * Returns true if call is allowed, false if limit exceeded.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  const redis = getRedisInstance();

  if (redis) {
    try {
      const redisKey = `ratelimit:${key}`;
      const count = await redis.incr(redisKey);
      if (count === 1) {
        // Set expiry on first hit
        await redis.pexpire(redisKey, windowMs);
      }
      return count <= limit;
    } catch (err) {
      console.warn('[RATE_LIMIT] Redis operation failed, using in-memory fallback:', err);
    }
  }

  // In-memory fallback
  const now = Date.now();

  // Run cleanup every 5 minutes or when bucket count exceeds 2,000 entries
  if (now - lastCleanupTime > CLEANUP_INTERVAL_MS || buckets.size > 2000) {
    purgeExpiredBuckets(now);
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  bucket.count += 1;
  return bucket.count <= limit;
}
