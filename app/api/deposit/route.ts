import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import redis, { KEYS } from '@/lib/redis';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-for-dev-only'
);

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('fragmentfi_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const address = payload.address as string;
    if (!address) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const { amountUsd, fragDelta, asset, txHash } = await req.json();
    if (amountUsd === undefined || fragDelta === undefined || !txHash) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Upsert user
    const userKey = KEYS.user(address);
    if (!(await redis.get(userKey))) {
      await redis.set(userKey, JSON.stringify({ wallet_address: address, created_at: new Date().toISOString() }));
    }

    // Update portfolio atomically using Redis GET + SET
    const portfolioKey = KEYS.portfolio(address);
    const existing = await redis.get<string>(portfolioKey);
    const portfolio = existing
      ? (typeof existing === 'string' ? JSON.parse(existing) : existing)
      : { frag_balance: 0, usd_value: 0 };

    const newPortfolio = {
      frag_balance: (portfolio.frag_balance || 0) + fragDelta,
      usd_value: (portfolio.usd_value || 0) + amountUsd,
      updated_at: new Date().toISOString(),
    };

    const txRecord = JSON.stringify({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type: 'DEPOSIT',
      amount_usd: amountUsd,
      frag_delta: fragDelta,
      txn_hash: txHash,
      asset: asset || 'XLM',
      timestamp: new Date().toISOString(),
    });

    await Promise.all([
      redis.set(portfolioKey, JSON.stringify(newPortfolio)),
      redis.lpush(KEYS.txns(address), txRecord),
      // Update global stats
      redis.incrbyfloat(KEYS.statsAum, amountUsd),
    ]);

    return NextResponse.json({ success: true, newBalance: newPortfolio.frag_balance });
  } catch (error) {
    console.error('Deposit API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
