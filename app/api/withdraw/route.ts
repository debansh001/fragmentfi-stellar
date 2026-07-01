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

    const { fragAmount, receiveUsd, targetAsset, txHash } = await req.json();
    if (fragAmount === undefined || receiveUsd === undefined || !txHash) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check balance
    const portfolioKey = KEYS.portfolio(address);
    const existing = await redis.get<string>(portfolioKey);
    const portfolio = existing
      ? (typeof existing === 'string' ? JSON.parse(existing) : existing)
      : { frag_balance: 0, usd_value: 0 };

    if ((portfolio.frag_balance || 0) < fragAmount) {
      return NextResponse.json({ error: 'Insufficient FRAG balance' }, { status: 400 });
    }

    const newPortfolio = {
      frag_balance: Math.max(0, (portfolio.frag_balance || 0) - fragAmount),
      usd_value: Math.max(0, (portfolio.usd_value || 0) - receiveUsd),
      updated_at: new Date().toISOString(),
    };

    const txRecord = JSON.stringify({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type: 'WITHDRAWAL',
      amount_usd: receiveUsd,
      frag_delta: -fragAmount,
      txn_hash: txHash,
      asset: targetAsset || 'XLM',
      timestamp: new Date().toISOString(),
    });

    await Promise.all([
      redis.set(portfolioKey, JSON.stringify(newPortfolio)),
      redis.lpush(KEYS.txns(address), txRecord),
      redis.incrbyfloat(KEYS.statsAum, -receiveUsd),
    ]);

    return NextResponse.json({ success: true, newBalance: newPortfolio.frag_balance });
  } catch (error) {
    console.error('Withdraw API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
