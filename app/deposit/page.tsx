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
          <DepositForm 
            onSuccess={(amountFrag, newBalance, txHash) => setSuccessData({ amountFrag, newBalance, txHash })} 
          />
        )}
      </div>
    </div>
  );
}
