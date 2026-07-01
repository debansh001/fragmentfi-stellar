import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import redis, { KEYS } from '@/lib/redis';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-for-dev-only'
);

const EMPTY_RESPONSE = {
  transactions: [],
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  summary: { totalDeposited: 0, totalWithdrawn: 0, totalYieldFrag: 0 },
};

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('fragmentfi_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const address = payload.address as string;
    if (!address) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const url = new URL(req.url);
    const type = url.searchParams.get('type') || 'all';
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const exportCsv = url.searchParams.get('export') === 'true';
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.max(1, parseInt(url.searchParams.get('limit') || '10'));

    // Fetch all transactions from Redis
    const raw = await redis.lrange(KEYS.txns(address), 0, -1);
    let allTxns: any[] = (raw || []).map((t: any) =>
      typeof t === 'string' ? JSON.parse(t) : t
    );

    // Filter by type
    if (type !== 'all') {
      allTxns = allTxns.filter((t) => t.type === type.toUpperCase());
    }

    // Filter by date
    if (startDate) {
      const start = new Date(startDate);
      allTxns = allTxns.filter((t) => new Date(t.timestamp) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      allTxns = allTxns.filter((t) => new Date(t.timestamp) <= end);
    }

    // CSV export
    if (exportCsv) {
      const csvHeader = 'ID,Type,Amount (USD),FRAG Delta,Transaction Hash,Timestamp\n';
      const csvRows = allTxns
        .map((tx) => `${tx.id},${tx.type},${tx.amount_usd},${tx.frag_delta},${tx.txn_hash || ''},${tx.timestamp}`)
        .join('\n');
      return new NextResponse(csvHeader + csvRows, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="fragmentfi_history_${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    // Summary from ALL user transactions (unfiltered)
    const allForSummary = await redis.lrange(KEYS.txns(address), 0, -1);
    const summary = (allForSummary || [])
      .map((t: any) => (typeof t === 'string' ? JSON.parse(t) : t))
      .reduce(
        (acc: any, tx: any) => {
          if (tx.type === 'DEPOSIT') acc.totalDeposited += tx.amount_usd || 0;
          if (tx.type === 'WITHDRAWAL') acc.totalWithdrawn += tx.amount_usd || 0;
          if (tx.type === 'YIELD') acc.totalYieldFrag += tx.frag_delta || 0;
          return acc;
        },
        { totalDeposited: 0, totalWithdrawn: 0, totalYieldFrag: 0 }
      );

    const total = allTxns.length;
    const skip = (page - 1) * limit;
    const transactions = allTxns.slice(skip, skip + limit);

    return NextResponse.json({
      transactions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      summary,
    });
  } catch (error) {
    console.error('History API Error:', error);
    return NextResponse.json(EMPTY_RESPONSE);
  }
}
