"use client";

import React, { useState, useEffect } from 'react';
import WithdrawForm from '@/components/WithdrawForm';
import TxnStatus from '@/components/TxnStatus';

export default function WithdrawPage() {
  const [successData, setSuccessData] = useState<{ amountFrag: number, newBalance: number, txHash: string } | null>(null);
  const [maxBalance, setMaxBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBalance() {
      try {
        const res = await fetch('/api/portfolio');
        if (res.ok) {
          const json = await res.json();
          setMaxBalance(json.portfolio.frag_balance);
        }
      } catch (error) {
        console.error("Failed to load portfolio:", error);
      } finally {
        setLoading(false);
      }
    }
    
    // Only fetch balance if we're not in the success state
    if (!successData) {
      fetchBalance();
    }
  }, [successData]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Withdraw Funds</h1>
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
          Burn your FRAG tokens to seamlessly withdraw USDC or XLM back to your Stellar wallet.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start w-full">
        <div className="flex justify-center w-full">
          {successData ? (
            <div className="w-full max-w-md">
              <TxnStatus 
                amountFrag={successData.amountFrag} 
                newBalance={successData.newBalance}
                txHash={successData.txHash}
                mode="withdraw"
                onReset={() => {
                  setSuccessData(null);
                  setLoading(true);
                }} 
              />
            </div>
          ) : loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <div className="w-full max-w-md">
              <WithdrawForm 
                maxBalance={maxBalance}
                onSuccess={(amountFrag, newBalance, txHash) => setSuccessData({ amountFrag, newBalance, txHash })} 
              />
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hidden md:block">
          <h3 className="text-lg font-semibold mb-4">Withdraw Information</h3>
          <ul className="space-y-4 text-sm text-muted-foreground">
            <li className="flex flex-col gap-1">
              <span className="font-medium text-foreground">Withdrawal Limits</span>
              <span>You can withdraw up to your total FRAG balance. FragmentFi maintains deep liquidity to fulfill withdrawals 24/7.</span>
            </li>
            <li className="flex flex-col gap-1">
              <span className="font-medium text-foreground">Processing Time</span>
              <span>Instant. Your FRAG is burned and the collateral (USDC/XLM) is immediately transferred to your wallet.</span>
            </li>
            <li className="flex flex-col gap-1">
              <span className="font-medium text-foreground">Conversion Rate</span>
              <span>1 FRAG = 1 USDC. If withdrawing as XLM, the USDC is converted via Stellar DEX at the best available market rate.</span>
            </li>
            <li className="flex flex-col gap-1">
              <span className="font-medium text-foreground">Yield Check</span>
              <span>Make sure you have claimed any pending yield before withdrawing your full balance, as yield generation stops on burned tokens.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
