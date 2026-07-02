import { NextResponse } from 'next/server';
import { executeDistributeCron, getTreasuryPoolBalance } from '@/lib/stellar';

// This is meant to be hit by a scheduled service like Vercel Cron.
export async function GET(req: Request) {
  try {
    // 1. Verify Authorization (e.g. Vercel Cron Secret)
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSecret = process.env.ADMIN_SECRET_KEY;
    if (!adminSecret) {
      return NextResponse.json({ error: 'Admin secret key not configured' }, { status: 500 });
    }

    // 2. Determine the pool balance
    const poolBalance = await getTreasuryPoolBalance();
    if (poolBalance <= 0) {
      return NextResponse.json({ message: 'No funds in treasury to distribute yield on.' });
    }

    // 3. Execute the distribution on the smart contract directly from the backend
    const txHash = await executeDistributeCron(adminSecret, poolBalance.toString());

    return NextResponse.json({ 
      success: true, 
      message: 'Weekly yield successfully distributed on-chain.',
      txHash 
    });
  } catch (error: any) {
    console.error('Cron distribution error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
