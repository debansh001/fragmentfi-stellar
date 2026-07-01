import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-for-dev-only'
);

export async function POST(req: Request) {
  try {
    const { address } = await req.json();

    if (!address || typeof address !== 'string' || address.length < 10) {
      return NextResponse.json({ error: 'Missing or invalid wallet address' }, { status: 400 });
    }

    // Issue JWT immediately — no DB/Redis required
    const token = await new SignJWT({ address })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    const response = NextResponse.json({ success: true, address });
    response.cookies.set('fragmentfi_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    // Sync user to Redis in background (non-blocking)
    syncUserToRedis(address).catch((e) =>
      console.warn('[verify] Redis user sync failed (non-critical):', e?.message)
    );

    return response;
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function syncUserToRedis(address: string) {
  const { default: redis, KEYS } = await import('@/lib/redis');
  const key = KEYS.user(address);
  const exists = await redis.exists(key);
  if (!exists) {
    await redis.set(key, JSON.stringify({
      wallet_address: address,
      created_at: new Date().toISOString(),
    }));
    // Increment holders count
    await redis.incr(KEYS.statsHolders);
  }
}
