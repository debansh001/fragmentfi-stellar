"use client";

import React, { useState } from 'react';
import DepositForm from '@/components/DepositForm';
import TxnStatus from '@/components/TxnStatus';

export default function DepositPage() {
  const [successData, setSuccessData] = useState<{ amountFrag: number, newBalance: number, txHash: string } | null>(null);

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Deposit to FragmentFi</h1>
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
          Convert your USDC or XLM into FRAG and start earning automated yield instantly.
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
                onReset={() => setSuccessData(null)} 
              />
            </div>
          ) : (
            <div className="w-full max-w-md">
              <DepositForm 
                onSuccess={(amountFrag, newBalance, txHash) => setSuccessData({ amountFrag, newBalance, txHash })} 
              />
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hidden md:block">
          <h3 className="text-lg font-semibold mb-4">Deposit Information</h3>
          <ul className="space-y-4 text-sm text-muted-foreground">
            <li className="flex flex-col gap-1">
              <span className="font-medium text-foreground">Transaction Fees</span>
              <span>FragmentFi charges 0% fees on deposits. Standard Stellar network fees apply (fraction of a cent).</span>
            </li>
            <li className="flex flex-col gap-1">
              <span className="font-medium text-foreground">Processing Time</span>
              <span>Instant. Your FRAG tokens are minted exactly when the Stellar transaction confirms (~5 seconds).</span>
            </li>
            <li className="flex flex-col gap-1">
              <span className="font-medium text-foreground">Conversion Rate</span>
              <span>1 USDC = 1 FRAG. XLM deposits are automatically swapped to USDC at the current market rate before minting.</span>
            </li>
            <li className="flex flex-col gap-1">
              <span className="font-medium text-foreground">Minimum Deposit</span>
              <span>No minimum deposit required, making it accessible for any amount.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
