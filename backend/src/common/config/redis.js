import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    console.warn(`[Redis] Retrying connection... (Attempt ${times})`);
    return Math.min(times * 50, 2000);
  },
});

redis.on("error", (err) => {
  console.error("[Redis] Error:", err.message);
});

redis.on("connect", () => {
  console.log("[Redis] Connected to Redis cache");
});

export default redis;
