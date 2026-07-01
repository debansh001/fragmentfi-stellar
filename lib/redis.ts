import { Redis } from '@upstash/redis';

// Graceful fallback when credentials not yet set
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  console.warn('[redis] UPSTASH_REDIS_REST_URL / TOKEN not set — Redis calls will throw. Add them to .env.local');
}

const redis = new Redis({
  url: url || 'https://placeholder.upstash.io',
  token: token || 'placeholder',
});

export default redis;

// ─── Key Schema ────────────────────────────────────────────────────────────────
export const KEYS = {
  user: (addr: string) => `user:${addr}`,
  portfolio: (addr: string) => `portfolio:${addr}`,
  txns: (addr: string) => `txns:${addr}`,
  yield: (addr: string) => `yield:${addr}`,
  statsAum: 'stats:aum',
  statsHolders: 'stats:holders',
};
