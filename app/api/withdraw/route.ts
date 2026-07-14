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

    const { fragAmount, receiveUsd, targetAsset, txHash } = await req.json();
    if (fragAmount === undefined || receiveUsd === undefined || !txHash) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch the old balance first
    const oldBalanceStr = await getFragBalance(address);
    const oldBalance = Number(oldBalanceStr) || 0;

    let trueOnChainBalance = oldBalance;
    
    // Poll for up to 8 seconds to allow the Stellar network to finalize the transaction state
    for (let i = 0; i < 4; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const currentBalanceStr = await getFragBalance(address);
      const currentBalance = Number(currentBalanceStr) || 0;
      
      if (currentBalance !== oldBalance) {
        trueOnChainBalance = currentBalance;
        break;
      }
    }

    // If the network is extremely congested and still hasn't updated the RPC state,
    // fallback to optimistic calculation to provide a smooth UX.
    if (trueOnChainBalance === oldBalance) {
      trueOnChainBalance = Math.max(0, oldBalance - fragAmount);
    }

    const portfolioKey = KEYS.portfolio(address);
    const newPortfolio = {
      frag_balance: trueOnChainBalance,
      usd_value: trueOnChainBalance * 1.0,
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
      // statsAum is now fetched entirely on-chain in reserves route.
    ]);

    return NextResponse.json({ success: true, newBalance: newPortfolio.frag_balance });
  } catch (error) {
    console.error('Withdraw API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
