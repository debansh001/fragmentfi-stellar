import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import prisma from '@/lib/db';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-for-dev-only');

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('fragmentfi_session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.id as string;

    const [portfolio, recentTransactions, yieldDistributions] = await Promise.all([
      prisma.portfolio.findUnique({
        where: { user_id: userId }
      }),
      prisma.transaction.findMany({
        where: { user_id: userId },
        orderBy: { timestamp: 'desc' },
        take: 5
      }),
      prisma.yieldDistribution.findMany({
        where: { user_id: userId }
      })
    ]);

    const totalYield = yieldDistributions.reduce((acc: any, curr: any) => acc + curr.amount, 0);

    return NextResponse.json({
      portfolio: portfolio || { frag_balance: 0, usd_value: 0 },
      recentTransactions,
      totalYield,
      currentApy: 12.5 // Mock APY
    });

  } catch (error) {
    console.error("Portfolio API Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
