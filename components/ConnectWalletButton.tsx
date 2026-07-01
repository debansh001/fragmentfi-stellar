"use client";

import { useWallet } from "@/hooks/useWallet";

export default function ConnectWalletButton() {
  const { address, isConnecting, connect, disconnect } = useWallet();

  const formatAddress = (addr: string) => {
    if (!addr || typeof addr !== 'string') return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (address) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground bg-muted px-3 py-1.5 rounded-md border border-border">
          {formatAddress(address)}
        </span>
        <button 
          onClick={disconnect}
          className="text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-2"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={connect}
      disabled={isConnecting}
      className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 w-full sm:w-auto"
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
