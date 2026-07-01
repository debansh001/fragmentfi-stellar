import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { distributeYieldOnChain } from '@/lib/stellar';

export async function GET(req: Request) {
  try {
    // 1. Verify cron secret to prevent unauthorized access
    // Vercel sets a CRON_SECRET header that matches the CRON_SECRET env variable
    const authHeader = req.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET || 'dev-cron-secret'}`;
    
    // For local dev without cron secret, we might skip this or allow a bypass, but it's good practice to enforce it
    if (process.env.NODE_ENV === 'production' && authHeader !== expectedAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch all users and calculate total pool balance
    // In our simplified mock, we sum all FRAG balances to find the total pool balance
    // since FRAG is 1:1 backed by XLM in the Treasury Pool.
    const allPortfolios = await prisma.portfolio.findMany({
      include: {
        user: true,
      }
    });

    let totalFragSupply = 0;
    for (const p of allPortfolios) {
      totalFragSupply += p.frag_balance;
    }

    if (totalFragSupply <= 0) {
      return NextResponse.json({ success: true, message: "No yield to distribute (pool is empty)" });
    }

    // 3. Calculate 4.5% APY yield for this week
    // Weekly Yield = (Total Pool * 0.045) / 52
    const totalWeeklyYield = (totalFragSupply * 0.045) / 52;
    const yieldPerFrag = totalWeeklyYield / totalFragSupply;

    // 4. Call Soroban smart contract to distribute yield on-chain
    // In production, we'd sign and submit with a securely stored admin Keypair
    const txHash = await distributeYieldOnChain(totalWeeklyYield);

    // 5. Write yield records to Neon Database and update portfolios
    const yieldOperations = [];
    
    for (const portfolio of allPortfolios) {
      if (portfolio.frag_balance > 0) {
        const userYield = portfolio.frag_balance * yieldPerFrag;
        
        yieldOperations.push(
          prisma.yieldDistribution.create({
            data: {
              user_id: portfolio.user_id,
              amount: userYield,
              txn_hash: `${txHash}_${portfolio.user_id}`,
            }
          })
        );
        
        yieldOperations.push(
          prisma.portfolio.update({
            where: { user_id: portfolio.user_id },
            data: {
              frag_balance: { increment: userYield },
              usd_value: { increment: userYield } // 1 FRAG = 1 USD for mock purposes
            }
          })
        );

        // Optional: Send email notification
        if (portfolio.user.email) {
          // sendEmail(portfolio.user.email, `You earned ${userYield.toFixed(2)} FRAG!`);
          console.log(`[Email Mock] Sent yield notification to ${portfolio.user.email} for ${userYield.toFixed(2)} FRAG`);
        }
      }
    }

    // Execute all updates in a transaction
    await prisma.$transaction(yieldOperations);

    return NextResponse.json({ 
      success: true, 
      totalYieldDistributed: totalWeeklyYield,
      transactionHash: txHash
    });

  } catch (error) {
    console.error("Cron Yield Distribution Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
