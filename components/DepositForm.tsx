"use client";

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { buildDepositTransaction } from '@/lib/stellar';

interface DepositFormProps {
  onSuccess: (amountFrag: number, newBalance: number, txHash: string) => void;
}

export default function DepositForm({ onSuccess }: DepositFormProps) {
  const { address, signTransaction } = useWallet();
  const [asset, setAsset] = useState<'XLM' | 'USDC'>('USDC');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock prices
  const TOKEN_PRICE = asset === 'USDC' ? 1.0 : 0.15; // 1 XLM = $0.15 for mock
  const FRAG_PRICE = 1.0; // 1 FRAG = $1.00

  const numAmount = parseFloat(amount) || 0;
  const usdValue = numAmount * TOKEN_PRICE;
  const fragToReceive = usdValue / FRAG_PRICE;
  
  const managementFee = fragToReceive * 0.005; // 0.5% fee
  const finalFrag = fragToReceive - managementFee;
  const weeklyYield = finalFrag * (0.125 / 52); // 12.5% APY / 52 weeks

  const handleDeposit = async () => {
    if (!address) {
      setError("Please connect your wallet first.");
      return;
    }
    
    if (numAmount <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Build Transaction
      const xdr = await buildDepositTransaction(address, numAmount.toString(), asset);
      
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
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountUsd: usdValue,
          fragDelta: finalFrag,
          asset,
          txHash: finalTxHash
        })
      });

      if (!res.ok) {
        throw new Error('Failed to record deposit on server');
      }

      const data = await res.json();
      
      // 4. Success callback
      onSuccess(finalFrag, data.newBalance, finalTxHash);

    } catch (e: any) {
      console.error(e);
      setError(e.message || "An error occurred during deposit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto w-full">
      <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Deposit Funds</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2 mb-6">
          <label className="text-sm font-medium text-foreground">Select Asset</label>
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
          <label className="text-sm font-medium text-foreground">Amount</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-md border border-input bg-transparent px-3 py-3 text-lg shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <span className="text-muted-foreground font-medium">{asset}</span>
            </div>
          </div>
        </div>

        {/* Live Preview & Fee Breakdown */}
        <div className="bg-muted/50 rounded-lg p-4 mb-6 flex flex-col gap-3 border border-border/50">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Exchange Rate</span>
            <span className="font-medium text-foreground">1 FRAG = $1.00</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Est. Value</span>
            <span className="font-medium text-foreground">${usdValue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Management Fee (0.5%)</span>
            <span className="font-medium text-red-500">-{managementFee.toFixed(2)} FRAG</span>
          </div>
          <div className="border-t border-border/50 pt-3 flex justify-between">
            <span className="font-semibold text-foreground">You Receive</span>
            <span className="font-bold text-primary">{finalFrag.toFixed(2)} FRAG</span>
          </div>
        </div>

        <div className="bg-primary/5 rounded-lg p-4 mb-6 border border-primary/20 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-primary">Est. First Weekly Yield</span>
            <span className="text-xs text-muted-foreground">Based on current 12.5% APY</span>
          </div>
          <span className="font-bold text-primary">+{weeklyYield.toFixed(4)} FRAG</span>
        </div>

        <button
          onClick={handleDeposit}
          disabled={isSubmitting || numAmount <= 0}
          className="w-full h-12 inline-flex items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-white shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            `Confirm Deposit`
          )}
        </button>
      </div>
    </div>
  );
}
