import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { default: redis, KEYS } = await import('@/lib/redis');

    const [aum, holders] = await Promise.all([
      redis.get<string>(KEYS.statsAum),
      redis.get<string>(KEYS.statsHolders),
    ]);

    return NextResponse.json({
      totalAUM: aum ? parseFloat(aum as string) || 0 : 0,
      activeHolders: holders ? parseInt(holders as string) || 0 : 0,
      currentApy: 12.5, // Hardcoded APY for now based on T-Bills
      reserveRatio: 100.0, // Should be 100% since 1:1 backed
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({
      totalAUM: 0,
      activeHolders: 0,
      currentApy: 12.5,
      reserveRatio: 100.0,
    });
  }
}
