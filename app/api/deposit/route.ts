import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import redis, { KEYS } from '@/lib/redis';
import { getFragBalance } from '@/lib/stellar';

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

    // We no longer trust amountUsd and fragDelta from the client for setting the balance.
    // They are only used for the cosmetic transaction log.
    const { amountUsd, fragDelta, asset, txHash } = await req.json();
    if (amountUsd === undefined || fragDelta === undefined || !txHash) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Upsert user
    const userKey = KEYS.user(address);
    if (!(await redis.get(userKey))) {
      await redis.set(userKey, JSON.stringify({ wallet_address: address, created_at: new Date().toISOString() }));
    }

    // Wait a brief moment to allow the Stellar network to finalize the transaction state,
    // though the transaction is already submitted, Soroban node state might be slightly delayed.
    await new Promise(resolve => setTimeout(resolve, 2000));

    // SECURE FIX: Fetch the actual on-chain balance from the smart contract!
    const trueOnChainBalanceStr = await getFragBalance(address);
    const trueOnChainBalance = Number(trueOnChainBalanceStr) || 0;

    const portfolioKey = KEYS.portfolio(address);
    const existing = await redis.get<string>(portfolioKey);
    const portfolio = existing
      ? (typeof existing === 'string' ? JSON.parse(existing) : existing)
      : { frag_balance: 0, usd_value: 0 };

    // Update the portfolio with undeniable on-chain truth
    const newPortfolio = {
      frag_balance: trueOnChainBalance,
      usd_value: trueOnChainBalance * 1.0, // FRAG is pegged 1:1 to USD
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
      // We removed the insecure statsAum increment. AUM is now fetched directly on-chain in the reserves route!
    ]);

    return NextResponse.json({ success: true, newBalance: newPortfolio.frag_balance });
  } catch (error) {
    console.error('Deposit API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
