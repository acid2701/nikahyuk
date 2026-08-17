export interface RateLimitEntry {
  attempts: number;
  lockoutUntil: number | null;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000
): { allowed: boolean; remaining: number; lockoutRemainingSeconds: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry) {
    return { allowed: true, remaining: maxAttempts, lockoutRemainingSeconds: 0 };
  }

  if (entry.lockoutUntil && entry.lockoutUntil > now) {
    const lockoutRemainingSeconds = Math.ceil((entry.lockoutUntil - now) / 1000);
    return { allowed: false, remaining: 0, lockoutRemainingSeconds };
  }

  if (entry.lockoutUntil && entry.lockoutUntil <= now) {
    rateLimitStore.delete(key);
    return { allowed: true, remaining: maxAttempts, lockoutRemainingSeconds: 0 };
  }

  const remaining = Math.max(0, maxAttempts - entry.attempts);
  return { allowed: entry.attempts < maxAttempts, remaining, lockoutRemainingSeconds: 0 };
}

export function recordFailedAttempt(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000
): { isLockedOut: boolean; lockoutUntil: number | null } {
  const now = Date.now();
  const entry = rateLimitStore.get(key) || { attempts: 0, lockoutUntil: null };

  entry.attempts += 1;

  if (entry.attempts >= maxAttempts) {
    entry.lockoutUntil = now + windowMs;
    rateLimitStore.set(key, entry);
    return { isLockedOut: true, lockoutUntil: entry.lockoutUntil };
  }

  rateLimitStore.set(key, entry);
  return { isLockedOut: false, lockoutUntil: null };
}

export function clearRateLimit(key: string): void {
  rateLimitStore.delete(key);
}
