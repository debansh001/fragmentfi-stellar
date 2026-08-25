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

    let payload;
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      payload = verified.payload;
    } catch {
      return NextResponse.json({ error: 'Session expired. Please reconnect your wallet.' }, { status: 401 });
    }
    const address = payload.address as string;
    if (!address) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const { amountUsd, fragDelta, asset, txHash } = await req.json();
    if (amountUsd === undefined || fragDelta === undefined || !txHash) {
      return NextResponse.json({ error: 'Missing required fields: amountUsd, fragDelta, txHash' }, { status: 400 });
    }

    // ── Step 1: Upsert user record (fast) ────────────────────────────────────
    const userKey = KEYS.user(address);
    if (!(await redis.get(userKey))) {
      await redis.set(userKey, JSON.stringify({ wallet_address: address, created_at: new Date().toISOString() }));
    }

    // ── Step 2: Get current on-chain balance (with a SHORT timeout) ──────────
    // We poll max 2 times × 1.5s = 3s total to avoid Vercel's 10s function limit.
    // If the network hasn't settled yet, we use the client-provided fragDelta
    // ONLY as an optimistic additive increment ON TOP of the last known balance,
    // and schedule a background reconciliation.
    let trueOnChainBalance: number | null = null;
    const oldBalanceStr = await getFragBalance(address);
    const oldBalance = Number(oldBalanceStr) || 0;

    for (let i = 0; i < 2; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const currentBalanceStr = await getFragBalance(address);
      const currentBalance = Number(currentBalanceStr) || 0;
      if (currentBalance !== oldBalance) {
        trueOnChainBalance = currentBalance;
        break;
      }
    }

    // ── Step 3: Determine final balance ──────────────────────────────────────
    // If the chain confirmed the balance change, use that.
    // If not (network slow / RPC lag), use optimistic: old + fragDelta.
    // The next time /api/portfolio is called, it will reconcile from chain anyway.
    const finalBalance = trueOnChainBalance !== null
      ? trueOnChainBalance
      : Math.max(0, oldBalance + (Number(fragDelta) || 0));

    // ── Step 4: Persist to Redis (fast) ──────────────────────────────────────
    const portfolioKey = KEYS.portfolio(address);
    const newPortfolio = {
      frag_balance: finalBalance,
      usd_value: finalBalance,
      updated_at: new Date().toISOString(),
      chain_confirmed: trueOnChainBalance !== null,
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
    ]);

    return NextResponse.json({
      success: true,
      newBalance: newPortfolio.frag_balance,
      chain_confirmed: trueOnChainBalance !== null,
    });
  } catch (error: any) {
    console.error('[Deposit API Error]', error?.message || error);
    return NextResponse.json(
      { error: `Deposit recording failed: ${error?.message || 'Internal server error'}` },
      { status: 500 }
    );
  }
}
