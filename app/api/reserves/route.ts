import { NextResponse } from 'next/server';
import { getFragTotalSupply, getTreasuryPoolBalance } from '@/lib/stellar';

export async function GET() {
  try {
    let auditLogs: any[] = [];
    let totalFragSupply = 0;
    let onChainReservesXlm = 0;

    try {
      // 1. Fetch real on-chain data
      const [supplyStr, poolBalanceStr] = await Promise.all([
        getFragTotalSupply(),
        getTreasuryPoolBalance()
      ]);
      
      totalFragSupply = Number(supplyStr) || 0;
      onChainReservesXlm = Number(poolBalanceStr) || 0;

      // 2. Fetch global recent transactions
      const { default: redis } = await import('@/lib/redis');
      const txnKeys = await redis.keys('txns:*');
      let allLogs: any[] = [];
      for (const key of txnKeys) {
        const logs = await redis.lrange(key, 0, 10);
        allLogs = allLogs.concat(logs.map(l => (typeof l === 'string' ? JSON.parse(l) : l)));
      }
      
      // Sort by timestamp descending
      allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      auditLogs = allLogs.slice(0, 50);
      
    } catch (e) {
      console.error('Failed to fetch from on-chain/redis in reserves:', e);
    }

    const fragPrice = 1.0;
    const supplyUsdValue = totalFragSupply * fragPrice;
    
    // We mock USDC just for visual parity since we only implemented XLM in the Soroban contract for now.
    // In a real production deployment, the contract would hold USDC and XLM.
    const onChainReservesUsdc = 0; // We don't have USDC deposited in the Soroban testnet pool
    const xlmPriceUsd = 0.15; // Assume static XLM price for USD calculation
    const totalReservesUsd = (onChainReservesXlm * xlmPriceUsd) + onChainReservesUsdc;

    const reserveRatio = totalFragSupply > 0 ? (totalReservesUsd / supplyUsdValue) * 100 : 100;

    return NextResponse.json({
      reserves: { totalReservesUsd, onChainReservesXlm, onChainReservesUsdc },
      supply: { totalFragSupply, supplyUsdValue },
      reserveRatio,
      auditLogs,
    });
  } catch (error) {
    console.error('Reserves API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
