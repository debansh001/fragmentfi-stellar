import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // On-chain reserve values (mocked until Soroban contract is fully deployed)
    const onChainReservesXlm = 154200.50;
    const onChainReservesUsdc = 1250000.00;
    const totalReservesUsd = (onChainReservesXlm * 0.15) + onChainReservesUsdc;

    // Fetch audit logs from Redis (global transaction list)
    let auditLogs: any[] = [];
    let totalFragSupply = 1000000;

    try {
      const { default: redis, KEYS } = await import('@/lib/redis');
      const aum = await redis.get<string>(KEYS.statsAum);
      if (aum) totalFragSupply = Math.max(1, parseFloat(aum as string));
    } catch {
      // Redis not configured yet — use mock
    }

    const fragPrice = 1.0;
    const supplyUsdValue = totalFragSupply * fragPrice;
    const reserveRatio = (totalReservesUsd / supplyUsdValue) * 100;

    return NextResponse.json({
      reserves: { totalReservesUsd, onChainReservesXlm, onChainReservesUsdc },
      supply: { totalFragSupply, supplyUsdValue },
      reserveRatio,
      auditLogs,
    });
  } catch (error) {
    console.error('Reserves API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
