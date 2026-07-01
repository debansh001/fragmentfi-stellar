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

    const { fragAmount, receiveUsd, targetAsset, txHash } = await req.json();

    if (fragAmount === undefined || receiveUsd === undefined || !txHash) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify sufficient balance
    const currentPortfolio = await prisma.portfolio.findUnique({
      where: { user_id: userId }
    });

    if (!currentPortfolio || currentPortfolio.frag_balance < fragAmount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Update the database transactionally
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Insert transaction record
      await tx.transaction.create({
        data: {
          user_id: userId,
          type: 'WITHDRAWAL',
          amount_usd: receiveUsd,
          frag_delta: -fragAmount,
          txn_hash: txHash,
        }
      });

      // 2. Update portfolio balance
      const portfolio = await tx.portfolio.update({
        where: { user_id: userId },
        data: {
          frag_balance: { decrement: fragAmount },
          usd_value: { decrement: receiveUsd }, // Simplified mock valuation update
        }
      });

      return portfolio;
    });

    return NextResponse.json({ success: true, newBalance: result.frag_balance });

  } catch (error) {
    console.error("Withdraw API Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
