import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import redis, { KEYS } from '@/lib/redis';
import { getFragBalance } from '@/lib/stellar';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-for-dev-only'
);

const EMPTY = {
  portfolio: { frag_balance: 0, usd_value: 0 },
  recentTransactions: [],
  totalYield: 0,
  currentApy: 12.5,
};

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('fragmentfi_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const address = payload.address as string;
    if (!address) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    // Ensure user record exists
    const userKey = KEYS.user(address);
    const existing = await redis.get(userKey);
    if (!existing) {
      await redis.set(userKey, JSON.stringify({ wallet_address: address, created_at: new Date().toISOString() }));
    }

    // Always fetch true on-chain balance for portfolio!
    // This removes relying strictly on our cached database, guaranteeing the dashboard is accurate.
    const trueOnChainBalanceStr = await getFragBalance(address);
    const trueOnChainBalance = Number(trueOnChainBalanceStr) || 0;
    const portfolio = {
      frag_balance: trueOnChainBalance,
      usd_value: trueOnChainBalance * 1.0,
      updated_at: new Date().toISOString(),
    };
    
    // Sync the cache while we're at it
    await redis.set(KEYS.portfolio(address), JSON.stringify(portfolio));

    const [txnsRaw, yieldRaw] = await Promise.all([
      redis.lrange(KEYS.txns(address), 0, 4),
      redis.lrange(KEYS.yield(address), 0, -1),
    ]);

    const recentTransactions = (txnsRaw || []).map((t: any) =>
      typeof t === 'string' ? JSON.parse(t) : t
    );

    const yieldList = (yieldRaw || []).map((y: any) =>
      typeof y === 'string' ? JSON.parse(y) : y
    );

    const totalYield = yieldList.reduce((acc: number, y: any) => acc + (y.amount || 0), 0);

    return NextResponse.json({
      portfolio,
      recentTransactions,
      totalYield,
      currentApy: 12.5, // Keeping visual mock of APY for demo purposes
    });
  } catch (error) {
    console.error('Portfolio API Error:', error);
    return NextResponse.json(EMPTY);
  }
}
