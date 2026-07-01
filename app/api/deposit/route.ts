import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import prisma from '@/lib/db';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-for-dev-only');

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('fragmentfi_session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.id as string;

    const { amountUsd, fragDelta, asset, txHash } = await req.json();

    if (amountUsd === undefined || fragDelta === undefined || !txHash) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // In a real production app, you would verify the transaction hash on the Stellar network
    // before crediting the user's account. For this demo, we assume the client successfully
    // submitted the signed transaction.

    // Update the database transactionally
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Insert transaction record
      await tx.transaction.create({
        data: {
          user_id: userId,
          type: 'DEPOSIT',
          amount_usd: amountUsd,
          frag_delta: fragDelta,
          txn_hash: txHash,
        }
      });

      // 2. Update portfolio balance
      const portfolio = await tx.portfolio.upsert({
        where: { user_id: userId },
        update: {
          frag_balance: { increment: fragDelta },
          usd_value: { increment: amountUsd },
        },
        create: {
          user_id: userId,
          frag_balance: fragDelta,
          usd_value: amountUsd,
        }
      });

      return portfolio;
    });

    return NextResponse.json({ success: true, newBalance: result.frag_balance });

  } catch (error) {
    console.error("Deposit API Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
