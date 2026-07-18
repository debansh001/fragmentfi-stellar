"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import WalletConnectModal, { WalletType } from "./WalletConnectModal";

export default function ConnectWalletButton() {
  const { address, isConnecting, connect, disconnect } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatAddress = (addr: string) => {
    if (!addr || typeof addr !== 'string') return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleConnect = (wallet: WalletType) => {
    if (wallet) {
      connect(wallet);
      setIsModalOpen(false);
    }
  };

  const [showCard, setShowCard] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (address) {
      fetch('/api/portfolio')
        .then(res => res.json())
        .then(data => {
          if (data.portfolio) {
            setBalance(data.portfolio.frag_balance);
          }
        })
        .catch(e => console.error("Failed to fetch balance", e));
    }
  }, [address]);

  if (address) {
    return (
      <div className="relative">
        <button 
          onClick={() => setShowCard(!showCard)}
          className="text-sm font-medium text-foreground bg-muted hover:bg-muted/80 transition-colors px-3 py-1.5 rounded-md border border-border flex items-center gap-2"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          {formatAddress(address)}
        </button>
        
        {showCard && (
          <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-background shadow-xl p-4 z-50 animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Connected Wallet</p>
                <p className="text-sm font-medium text-foreground font-mono break-all leading-tight">{formatAddress(address)}</p>
              </div>
              <div className="h-px bg-border w-full"></div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Balance</p>
                <p className="text-lg font-bold text-foreground">
                  {balance !== null ? `${balance.toFixed(2)} FRAG` : 'Loading...'}
                </p>
              </div>
              <button 
                onClick={disconnect}
                className="mt-2 w-full text-xs font-medium text-red-500 hover:text-red-600 bg-red-500/10 hover:bg-red-500/20 py-2 rounded-md transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        disabled={isConnecting}
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 w-full sm:w-auto"
      >
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </button>

      <WalletConnectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConnect={handleConnect}
        isConnecting={isConnecting}
      />
    </>
  );
}
