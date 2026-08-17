import { describe, it, expect, beforeEach } from "vitest";
import {
  checkRateLimit,
  recordFailedAttempt,
  clearRateLimit,
} from "@/lib/utils/rate-limiter";

describe("Rate Limiter Unit Tests", () => {
  const testIp = "192.168.1.100";

  beforeEach(() => {
    clearRateLimit(testIp);
  });

  it("should allow initial access with max remaining attempts", () => {
    const res = checkRateLimit(testIp, 5);
    expect(res.allowed).toBe(true);
    expect(res.remaining).toBe(5);
  });

  it("should decrement remaining attempts on failed login", () => {
    recordFailedAttempt(testIp, 5);
    const res = checkRateLimit(testIp, 5);
    expect(res.allowed).toBe(true);
    expect(res.remaining).toBe(4);
  });

  it("should trigger lockout after 5 failed attempts", () => {
    for (let i = 0; i < 4; i++) {
      recordFailedAttempt(testIp, 5);
    }
    expect(checkRateLimit(testIp, 5).allowed).toBe(true);

    const res5 = recordFailedAttempt(testIp, 5);
    expect(res5.isLockedOut).toBe(true);

    const checkRes = checkRateLimit(testIp, 5);
    expect(checkRes.allowed).toBe(false);
    expect(checkRes.lockoutRemainingSeconds).toBeGreaterThan(0);
  });

  it("should clear rate limit state on successful PIN verification", () => {
    recordFailedAttempt(testIp, 5);
    recordFailedAttempt(testIp, 5);
    clearRateLimit(testIp);

    const res = checkRateLimit(testIp, 5);
    expect(res.allowed).toBe(true);
    expect(res.remaining).toBe(5);
  });
});
