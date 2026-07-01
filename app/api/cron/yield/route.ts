import { NextResponse } from 'next/server';
import redis, { KEYS } from '@/lib/redis';

export async function GET(req: Request) {
  try {
    // 1. Verify cron secret
    const authHeader = req.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET || 'dev-cron-secret'}`;
    if (process.env.NODE_ENV === 'production' && authHeader !== expectedAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Scan all portfolio keys in Redis
    // We use a scan pattern to find all portfolio:{address} keys
    let cursor = 0;
    let portfolioKeys: string[] = [];

    do {
      const [nextCursor, keys] = await redis.scan(cursor, {
        match: 'portfolio:*',
        count: 100,
      });
      cursor = parseInt(nextCursor as string);
      portfolioKeys.push(...(keys as string[]));
    } while (cursor !== 0);

    if (portfolioKeys.length === 0) {
      return NextResponse.json({ success: true, message: 'No portfolios to distribute yield to.' });
    }

    // 3. Fetch all portfolios
    const portfolios = await Promise.all(
      portfolioKeys.map(async (key) => {
        const raw = await redis.get<string>(key);
        const address = key.replace('portfolio:', '');
        const data = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null;
        return data ? { address, ...data } : null;
      })
    );

    const active = portfolios.filter(
      (p): p is NonNullable<typeof p> => p !== null && (p.frag_balance || 0) > 0
    );

    const totalFragSupply = active.reduce((sum, p) => sum + (p.frag_balance || 0), 0);

    if (totalFragSupply <= 0) {
      return NextResponse.json({ success: true, message: 'Pool is empty — no yield to distribute.' });
    }

    // 4. Calculate weekly yield at 4.5% APY
    const totalWeeklyYield = (totalFragSupply * 0.045) / 52;
    const yieldPerFrag = totalWeeklyYield / totalFragSupply;
    const txHash = `yield_${Date.now()}`;

    // 5. Distribute yield to each holder
    const distributions = active.map(async (p) => {
      const userYield = (p.frag_balance || 0) * yieldPerFrag;

      const newPortfolio = {
        frag_balance: (p.frag_balance || 0) + userYield,
        usd_value: (p.usd_value || 0) + userYield,
        updated_at: new Date().toISOString(),
      };

      const yieldRecord = JSON.stringify({
        id: `${Date.now()}-${p.address.slice(0, 6)}`,
        type: 'YIELD',
        amount: userYield,
        frag_delta: userYield,
        amount_usd: userYield,
        txn_hash: `${txHash}_${p.address.slice(0, 8)}`,
        timestamp: new Date().toISOString(),
      });

      await Promise.all([
        redis.set(KEYS.portfolio(p.address), JSON.stringify(newPortfolio)),
        redis.lpush(KEYS.yield(p.address), yieldRecord),
        redis.lpush(KEYS.txns(p.address), yieldRecord),
      ]);
    });

    await Promise.all(distributions);

    // Update global AUM
    await redis.incrbyfloat(KEYS.statsAum, totalWeeklyYield);

    return NextResponse.json({
      success: true,
      totalYieldDistributed: totalWeeklyYield,
      transactionHash: txHash,
      holdersCount: active.length,
    });
  } catch (error) {
    console.error('Cron Yield Distribution Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
