/**
 * Rate Limiter for API endpoints
 * Simple in-memory rate limiter for development/startup use.
 * For production at scale, replace with Redis-based limiter.
 */

interface RateLimitRecord {
    count: number;
    resetTime: number;
}

interface RateLimitConfig {
    windowMs: number;  // Time window in milliseconds
    maxRequests: number;  // Max requests per window
}

// In-memory store (use Redis in production for multi-instance deployments)
const stores = new Map<string, Map<string, RateLimitRecord>>();

/**
 * Create a rate limiter for a specific endpoint
 */
export function createRateLimiter(name: string, config: RateLimitConfig) {
    // Get or create store for this limiter
    if (!stores.has(name)) {
        stores.set(name, new Map());
    }
    const store = stores.get(name)!;

    // Periodic cleanup of expired entries (every 5 minutes)
    setInterval(() => {
        const now = Date.now();
        for (const [key, record] of store.entries()) {
            if (now > record.resetTime) {
                store.delete(key);
            }
        }
    }, 5 * 60 * 1000);

    return {
        /**
         * Check if an identifier is rate limited
         * Returns { limited: boolean, remaining: number, resetTime: number }
         */
        check(identifier: string): { limited: boolean; remaining: number; retryAfterMs: number } {
            const now = Date.now();
            const record = store.get(identifier);

            // No record or expired - create new one
            if (!record || now > record.resetTime) {
                store.set(identifier, {
                    count: 1,
                    resetTime: now + config.windowMs,
                });
                return {
                    limited: false,
                    remaining: config.maxRequests - 1,
                    retryAfterMs: 0,
                };
            }

            // Check if over limit
            if (record.count >= config.maxRequests) {
                return {
                    limited: true,
                    remaining: 0,
                    retryAfterMs: record.resetTime - now,
                };
            }

            // Increment count
            record.count++;
            return {
                limited: false,
                remaining: config.maxRequests - record.count,
                retryAfterMs: 0,
            };
        },

        /**
         * Reset the rate limit for an identifier (e.g., after successful action)
         */
        reset(identifier: string): void {
            store.delete(identifier);
        },
    };
}

// Pre-configured rate limiters for common use cases

/**
 * Login rate limiter: 5 attempts per minute per email
 */
export const loginRateLimiter = createRateLimiter('login', {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 5,
});

/**
 * OTP send rate limiter: 3 requests per minute per email
 */
export const otpSendRateLimiter = createRateLimiter('otp-send', {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 3,
});

/**
 * OTP verify rate limiter: 5 attempts per 15 minutes per email
 */
export const otpVerifyRateLimiter = createRateLimiter('otp-verify', {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
});

/**
 * Password reset rate limiter: 3 requests per hour per email
 */
export const passwordResetRateLimiter = createRateLimiter('password-reset', {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
});

/**
 * API general rate limiter: 100 requests per minute per IP
 */
export const apiRateLimiter = createRateLimiter('api-general', {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 100,
});

/**
 * File upload rate limiter: 10 uploads per hour per user
 */
export const uploadRateLimiter = createRateLimiter('upload', {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
});
