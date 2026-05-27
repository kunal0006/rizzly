import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    
    // Rate limit: 5 requests per 60 seconds (for expensive AI endpoints)
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      analytics: true,
      prefix: "rizzly_ratelimit",
    });
  } catch (error) {
    console.error("Failed to initialize Upstash Redis:", error);
  }
} else {
  console.warn("Upstash Redis credentials are not configured. Rate limiting is currently disabled.");
}

export async function getClientIp(): Promise<string> {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim();
    }
    const realIp = headersList.get("x-real-ip");
    if (realIp) {
      return realIp.trim();
    }
  } catch (e) {
    // ignore headers error if called outside of request context
  }
  return "127.0.0.1";
}

export async function checkRateLimit(identifier: string) {
  if (!ratelimit) {
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }
  
  try {
    const result = await ratelimit.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error("Rate limit check encountered an error:", error);
    // Fallback: allow request to proceed if Redis is unreachable
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }
}
