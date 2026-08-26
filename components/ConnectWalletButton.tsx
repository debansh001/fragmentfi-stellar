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
  const [copied, setCopied] = useState(false);

  const fetchBalance = () => {
    if (!address) return;
    fetch('/api/portfolio')
      .then(res => res.json())
      .then(data => {
        if (data.portfolio) {
          setBalance(data.portfolio.frag_balance);
        }
      })
      .catch(e => console.error("Failed to fetch balance", e));
  };

  useEffect(() => {
    fetchBalance();

    const handleBalanceUpdate = () => fetchBalance();
    window.addEventListener('balance_update', handleBalanceUpdate);
    return () => window.removeEventListener('balance_update', handleBalanceUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted-foreground">Connected Wallet</p>
                  <button 
                    onClick={handleCopy}
                    className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                  >
                    {copied ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>
                    )}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
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
