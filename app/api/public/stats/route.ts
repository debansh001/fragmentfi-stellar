import { NextResponse } from 'next/server';

const MOCK = { totalAUM: 1250000, activeHolders: 1420, currentApy: 12.5, reserveRatio: 104.2 };

export async function GET() {
  try {
    const { default: redis, KEYS } = await import('@/lib/redis');

    const [aum, holders] = await Promise.all([
      redis.get<string>(KEYS.statsAum),
      redis.get<string>(KEYS.statsHolders),
    ]);

    return NextResponse.json({
      totalAUM: aum ? parseFloat(aum as string) || MOCK.totalAUM : MOCK.totalAUM,
      activeHolders: holders ? parseInt(holders as string) || MOCK.activeHolders : MOCK.activeHolders,
      currentApy: MOCK.currentApy,
      reserveRatio: MOCK.reserveRatio,
    });
  } catch {
    return NextResponse.json(MOCK);
  }
}
