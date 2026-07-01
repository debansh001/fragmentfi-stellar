import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import prisma from '@/lib/db';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-for-dev-only');

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('fragmentfi_session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.id as string;

    const url = new URL(req.url);
    const type = url.searchParams.get('type');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const exportCsv = url.searchParams.get('export') === 'true';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    // Build the query where clause
    const where: any = { user_id: userId };
    
    if (type && type !== 'all') {
      where.type = type.toUpperCase();
    }
    
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.timestamp.lte = end;
      }
    }

    // Export full filtered result if CSV requested
    if (exportCsv) {
      const allTxns = await prisma.transaction.findMany({
        where,
        orderBy: { timestamp: 'desc' }
      });
      
      const csvHeader = 'ID,Type,Amount (USD),FRAG Delta,Transaction Hash,Timestamp\n';
      const csvRows = allTxns.map((tx: any) => 
        `${tx.id},${tx.type},${tx.amount_usd},${tx.frag_delta},${tx.txn_hash || ''},${tx.timestamp.toISOString()}`
      ).join('\n');
      
      return new NextResponse(csvHeader + csvRows, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="fragmentfi_history_${new Date().toISOString().slice(0,10)}.csv"`
        }
      });
    }

    // Pagination query
    const skip = (page - 1) * limit;
    
    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where })
    ]);

    // Calculate Summary Stats (ignoring filters for overall totals, or could be based on current view. We'll do overall for the user)
    const allUserTxns = await prisma.transaction.findMany({
      where: { user_id: userId },
      select: { type: true, amount_usd: true, frag_delta: true }
    });
    
    const summary = allUserTxns.reduce(
      (acc: any, tx: any) => {
        if (tx.type === 'DEPOSIT') acc.totalDeposited += tx.amount_usd;
        if (tx.type === 'WITHDRAWAL') acc.totalWithdrawn += tx.amount_usd;
        if (tx.type === 'YIELD') acc.totalYieldFrag += tx.frag_delta;
        return acc;
      },
      { totalDeposited: 0, totalWithdrawn: 0, totalYieldFrag: 0 }
    );

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      summary
    });

  } catch (error) {
    console.error("History API Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
