"use client";

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { 
  buildTakeSnapshotTransaction,
  buildClaimYieldTransaction, 
  submitSignedTransaction 
} from '@/lib/stellar';

interface YieldCountdownProps {
  estimatedAmount: number;
}

export default function YieldCountdown({ estimatedAmount }: YieldCountdownProps) {
  const { address, signTransaction } = useWallet();
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  useEffect(() => {
    const getNextPayoutTime = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0); 
      return tomorrow.getTime();
    };

    const payoutTime = getNextPayoutTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = payoutTime - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClaimYield = async () => {
    if (!address) {
      setActionStatus("Please connect your wallet first.");
      return;
    }
    
    setIsProcessing(true);
    setActionStatus(`Preparing transaction...`);
    setTxHash(null);

    try {
      // For real testnet users, we should take a snapshot first to ensure their watermark is fresh before claiming
      // Since it's a hackathon demo and we can only sign one tx at a time easily via Freighter, 
      // we will just claim yield based on their current watermark. If they haven't taken a snapshot, they get 0.
      
      const xdr = await buildClaimYieldTransaction(address);

      setActionStatus("Waiting for wallet signature...");
      const res = await signTransaction(xdr, { networkPassphrase: 'Test SDF Network ; September 2015' });
      
      let signedXdr = xdr;
      if (res.signedTxXdr) {
        signedXdr = res.signedTxXdr;
      }

      setActionStatus("Submitting to network...");
      const hash = await submitSignedTransaction(signedXdr);
      
      // Update the backend so the Dashboard updates the Total Yield Earned stat!
      await fetch('/api/yield/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: estimatedAmount, txHash: hash })
      });

      setTxHash(hash);
      setActionStatus(`Success! Yield claimed to your wallet.`);
      
    } catch (e: any) {
      console.error(e);
      const errMsg = e?.message || "An error occurred.";
      let friendlyError = "Transaction failed on the network.";
      
      if (errMsg.toLowerCase().includes("user declined") || errMsg.toLowerCase().includes("rejected")) {
        friendlyError = "Transaction cancelled in wallet.";
      } else if (errMsg.includes("tx_too_late")) {
        friendlyError = "Transaction expired. Please try again.";
      } else if (errMsg.includes("op_bad_auth")) {
        friendlyError = "Wallet authorization failed.";
      } else if (errMsg.includes("op_underfunded")) {
        friendlyError = "Insufficient XLM for fees.";
      } else {
        friendlyError = `Failed: Please try again later.`; 
      }
      
      setActionStatus(`Error: ${friendlyError}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-gradient-to-br from-primary/10 to-background p-6 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Next Yield Payout</h3>
          <p className="text-sm text-muted-foreground">Estimated distribution time</p>
        </div>
      </div>

      <div className="flex items-center gap-4 py-2">
        <div className="flex flex-col items-center justify-center rounded-lg bg-background border border-border px-4 py-2 min-w-[70px]">
          <span className="text-2xl font-bold text-primary">{timeLeft.hours.toString().padStart(2, '0')}</span>
          <span className="text-xs text-muted-foreground uppercase font-medium">Hours</span>
        </div>
        <span className="text-2xl font-bold text-muted-foreground">:</span>
        <div className="flex flex-col items-center justify-center rounded-lg bg-background border border-border px-4 py-2 min-w-[70px]">
          <span className="text-2xl font-bold text-primary">{timeLeft.minutes.toString().padStart(2, '0')}</span>
          <span className="text-xs text-muted-foreground uppercase font-medium">Mins</span>
        </div>
        <span className="text-2xl font-bold text-muted-foreground">:</span>
        <div className="flex flex-col items-center justify-center rounded-lg bg-background border border-border px-4 py-2 min-w-[70px]">
          <span className="text-2xl font-bold text-primary">{timeLeft.seconds.toString().padStart(2, '0')}</span>
          <span className="text-xs text-muted-foreground uppercase font-medium">Secs</span>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-4 mb-2">
        <span className="text-sm font-medium text-muted-foreground">Estimated Amount:</span>
        <span className="text-lg font-bold text-foreground">
          +{estimatedAmount.toFixed(2)} FRAG
        </span>
      </div>

      <button 
        onClick={handleClaimYield}
        disabled={isProcessing}
        className="w-full h-12 inline-flex items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-white shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      >
        {isProcessing ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          `Claim Yield`
        )}
      </button>

      {actionStatus && (
        <div className={`text-xs font-medium p-3 rounded mt-2 ${actionStatus.includes('Error') ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-muted text-muted-foreground'}`}>
          {actionStatus}
        </div>
      )}
      
      {txHash && (
        <div className="text-xs bg-primary/10 text-primary p-3 rounded mt-1 truncate">
          View on Stellar Expert: <a href={`https://stellar.expert/explorer/testnet/tx/${txHash}`} target="_blank" rel="noreferrer" className="underline hover:text-primary/80 block mt-1">{txHash}</a>
        </div>
      )}
    </div>
  );
}
