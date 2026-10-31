// Best-effort, in-memory rate limiting. Nothing is persisted anywhere.
// On serverless hosting each warm instance keeps its own counters, which is enough to blunt casual spam.
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; retryAfter: number } {
  const now = Date.now();

  if (buckets.size > 500) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }
  bucket.count += 1;
  return { allowed: bucket.count <= limit, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
}
