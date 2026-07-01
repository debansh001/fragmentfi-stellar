"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

interface TxnStatusProps {
  amountFrag: number;
  newBalance: number;
  mode?: 'deposit' | 'withdraw';
  txHash?: string;
  onReset: () => void;
}

export default function TxnStatus({ amountFrag, newBalance, mode = 'deposit', txHash, onReset }: TxnStatusProps) {
  useEffect(() => {
    // Fire confetti on mount
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#3b82f6', '#10b981', '#f59e0b']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#3b82f6', '#10b981', '#f59e0b']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-border bg-background shadow-sm">
      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      
      <h2 className="text-2xl font-bold text-foreground mb-2">
        {mode === 'deposit' ? 'Deposit Successful!' : 'Withdrawal Successful!'}
      </h2>
      <p className="text-muted-foreground mb-6">
        {mode === 'deposit' 
          ? `You successfully deposited funds and received ` 
          : `You successfully withdrew funds and burned `}
        <span className="font-semibold text-foreground">{amountFrag.toFixed(2)} FRAG</span>.
      </p>

      {txHash && (
        <div className="mb-6 flex flex-col items-center gap-1.5">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Transaction Proof</span>
          <a 
            href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-bold text-sm transition-all border border-primary/20 hover:border-primary/30"
          >
            Verify on Stellar.Expert 🔍
          </a>
        </div>
      )}

      <div className="bg-muted w-full p-4 rounded-lg mb-8">
        <p className="text-sm text-muted-foreground mb-1">New FRAG Balance</p>
        <p className="text-2xl font-bold text-foreground">{newBalance.toFixed(2)} FRAG</p>
      </div>

      <div className="flex gap-4 w-full sm:w-auto">
        <Link 
          href="/dashboard"
          className="flex-1 sm:flex-none inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          View Dashboard
        </Link>
        <button 
          onClick={onReset}
          className="flex-1 sm:flex-none inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-white shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {mode === 'deposit' ? 'Deposit More' : 'Withdraw More'}
        </button>
      </div>
    </div>
  );
}
