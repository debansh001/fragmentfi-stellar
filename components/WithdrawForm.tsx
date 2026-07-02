"use client";

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { buildWithdrawTransaction } from '@/lib/stellar';

interface WithdrawFormProps {
  maxBalance: number;
  onSuccess: (amountFrag: number, newBalance: number, txHash: string) => void;
}

export default function WithdrawForm({ maxBalance, onSuccess }: WithdrawFormProps) {
  const { address, signTransaction } = useWallet();
  const [asset, setAsset] = useState<'USDC' | 'XLM'>('USDC');
  const [amountStr, setAmountStr] = useState('');
  const [sliderValue, setSliderValue] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const FRAG_PRICE = 1.0; 
  const TOKEN_PRICE = asset === 'USDC' ? 1.0 : 0.15; 
  const WITHDRAWAL_FEE_RATE = 0.01; // 1%

  const amountFrag = parseFloat(amountStr) || 0;
  const grossUsdValue = amountFrag * FRAG_PRICE;
  const feeUsd = grossUsdValue * WITHDRAWAL_FEE_RATE;
  const netUsdValue = grossUsdValue - feeUsd;
  const targetTokenAmount = netUsdValue / TOKEN_PRICE;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percent = parseInt(e.target.value);
    setSliderValue(percent);
    const newAmount = (maxBalance * (percent / 100)).toFixed(4);
    setAmountStr(newAmount === '0.0000' ? '' : newAmount);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAmountStr(val);
    const num = parseFloat(val) || 0;
    if (maxBalance > 0) {
      setSliderValue(Math.min(100, Math.max(0, Math.round((num / maxBalance) * 100))));
    }
  };

  const handleMaxClick = () => {
    setAmountStr(maxBalance.toString());
    setSliderValue(100);
  };

  const handleWithdraw = async () => {
    if (!address) {
      setError("Please connect your wallet first.");
      return;
    }
    
    if (amountFrag <= 0 || amountFrag > maxBalance) {
      setError("Enter a valid amount within your balance.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Build Transaction (Mock Soroban burn)
      const xdr = await buildWithdrawTransaction(address, amountFrag.toString(), asset);
      
      // 2. Sign via Freighter & Submit
      let signedXdr = xdr;
      let finalTxHash = '';
      try {
        const res = await signTransaction(xdr, { networkPassphrase: 'Test SDF Network ; September 2015' }); 
        if (res.signedTxXdr) {
          signedXdr = res.signedTxXdr;
        }

        // 3. Submit to Stellar Network
        const { submitSignedTransaction } = await import('@/lib/stellar');
        finalTxHash = await submitSignedTransaction(signedXdr);
      } catch (e: any) {
        console.error("Freighter signing or network submission failed.", e);
        const errMsg = e?.message || "";
        if (errMsg.toLowerCase().includes("user declined") || errMsg.toLowerCase().includes("rejected")) {
          throw new Error("Transaction cancelled in wallet.");
        }
        throw new Error(errMsg || "Failed to sign or submit transaction to network.");
      }

      // 4. Submit to API to record transaction and update balance
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fragAmount: amountFrag,
          receiveUsd: netUsdValue,
          targetAsset: asset,
          txHash: finalTxHash
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to record withdrawal on server');
      }

      const data = await res.json();
      
      // 4. Success callback
      onSuccess(amountFrag, data.newBalance, finalTxHash);

    } catch (e: any) {
      console.error(e);
      setError(e.message || "An error occurred during withdrawal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto w-full">
      <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Withdraw Funds</h2>
          <span className="text-sm text-muted-foreground font-medium">Balance: {maxBalance.toFixed(2)} FRAG</span>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2 mb-6">
          <label className="text-sm font-medium text-foreground">Withdraw As</label>
          <div className="flex bg-muted p-1 rounded-lg">
            <button
              onClick={() => setAsset('USDC')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${asset === 'USDC' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              USDC
            </button>
            <button
              onClick={() => setAsset('XLM')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${asset === 'XLM' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              XLM
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-6">
          <div className="flex justify-between items-end">
            <label className="text-sm font-medium text-foreground">Amount to burn</label>
            <button onClick={handleMaxClick} className="text-xs font-semibold text-primary hover:underline">
              MAX
            </button>
          </div>
          <div className="relative">
            <input
              type="number"
              value={amountStr}
              onChange={handleAmountChange}
              placeholder="0.00"
              max={maxBalance}
              className="w-full rounded-md border border-input bg-transparent px-3 py-3 text-lg shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <span className="text-muted-foreground font-medium">FRAG</span>
            </div>
          </div>
          
          <div className="mt-2 px-1">
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={sliderValue} 
              onChange={handleSliderChange}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-6 flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
          </svg>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-amber-800 dark:text-amber-400">Withdrawal Notice</span>
            <span className="text-xs text-amber-700 dark:text-amber-500 mt-1">A 1% early withdrawal fee applies. Cross-chain bridging may take 2-5 minutes to finalize.</span>
          </div>
        </div>

        {/* Live Preview & Fee Breakdown */}
        <div className="bg-muted/50 rounded-lg p-4 mb-6 flex flex-col gap-3 border border-border/50">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Gross Value</span>
            <span className="font-medium text-foreground">${grossUsdValue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Withdrawal Fee (1%)</span>
            <span className="font-medium text-red-500">-${feeUsd.toFixed(2)}</span>
          </div>
          <div className="border-t border-border/50 pt-3 flex justify-between">
            <span className="font-semibold text-foreground">You Receive</span>
            <div className="flex flex-col items-end">
              <span className="font-bold text-primary">{targetTokenAmount.toFixed(4)} {asset}</span>
              <span className="text-xs text-muted-foreground">≈ ${netUsdValue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleWithdraw}
          disabled={isSubmitting || amountFrag <= 0 || amountFrag > maxBalance}
          className="w-full h-12 inline-flex items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-white shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            `Burn & Withdraw`
          )}
        </button>
      </div>
    </div>
  );
}
