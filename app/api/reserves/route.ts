import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { Server } from 'stellar-sdk';

const HORIZON_URL = process.env.NEXT_PUBLIC_HORIZON_URL || 'https://horizon-testnet.stellar.org';
const server = new Server(HORIZON_URL);

// In a real Soroban contract integration, you'd fetch the contract state or account balance
const CONTRACT_ADDRESS = 'CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

export async function GET() {
  try {
    // 1. Fetch live reserves from Horizon/Soroban
    // For demo purposes, since the contract isn't deployed, we'll mock the on-chain fetch
    /*
    const account = await server.accounts().accountId(CONTRACT_ADDRESS).call();
    const xlmBalance = account.balances.find(b => b.asset_type === 'native')?.balance;
    */
    
    // Mocking on-chain reserve values
    const onChainReservesXlm = 154200.50;
    const onChainReservesUsdc = 1250000.00;
    
    // Calculate total USD value of reserves (mock 1 XLM = $0.15)
    const totalReservesUsd = (onChainReservesXlm * 0.15) + onChainReservesUsdc;

    // 2. Fetch total FRAG supply from DB (or Horizon if FRAG is a standard Stellar asset)
    // Here we sum all user balances from our database to represent the issued supply
    const aggregations = await prisma.portfolio.aggregate({
      _sum: {
        frag_balance: true
      }
    });
    
    // Fallback if db is empty, mock a 1M supply
    const totalFragSupply = aggregations._sum.frag_balance || 1000000;
    const fragPrice = 1.0; // 1 FRAG = 1 USD
    
    const supplyUsdValue = totalFragSupply * fragPrice;
    
    // 3. Calculate Reserve Ratio
    // Total Reserves (USD) / Total Supply (USD)
    // A healthy system is >= 100%
    const reserveRatio = (totalReservesUsd / supplyUsdValue) * 100;

    // 4. Fetch Global Audit Logs (Transactions)
    // We'll fetch the most recent global transactions for the audit log table
    const recentGlobalTransactions = await prisma.transaction.findMany({
      orderBy: { timestamp: 'desc' },
      take: 15,
      include: {
        user: {
          select: { wallet_address: true }
        }
      }
    });

    // Format for the frontend
    const auditLogs = recentGlobalTransactions.map(tx => ({
      id: tx.id,
      type: tx.type,
      wallet_address: tx.user.wallet_address,
      amount_usd: tx.amount_usd,
      frag_delta: tx.frag_delta,
      timestamp: tx.timestamp,
      txn_hash: tx.txn_hash
    }));

    return NextResponse.json({
      reserves: {
        totalReservesUsd,
        onChainReservesXlm,
        onChainReservesUsdc,
      },
      supply: {
        totalFragSupply,
        supplyUsdValue
      },
      reserveRatio,
      auditLogs
    });

  } catch (error) {
    console.error("Reserves API Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
