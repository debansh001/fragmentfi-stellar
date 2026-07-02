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

    const { amount, txHash } = await req.json();
    if (amount === undefined || !txHash) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const yieldRecord = JSON.stringify({
      id: `yield-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      amount: amount,
      timestamp: new Date().toISOString(),
      txn_hash: txHash,
    });

    const txRecord = JSON.stringify({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type: 'YIELD',
      amount_usd: amount * 0.15, // Mock XLM price
      frag_delta: amount,
      txn_hash: txHash,
      asset: 'XLM',
      timestamp: new Date().toISOString(),
    });

    // Record the yield payout and the transaction for the dashboard
    await Promise.all([
      redis.lpush(KEYS.yield(address), yieldRecord),
      redis.lpush(KEYS.txns(address), txRecord),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Claim Yield API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
