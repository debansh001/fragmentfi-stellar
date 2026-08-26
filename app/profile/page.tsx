"use client";

import { useWallet } from "@/hooks/useWallet";
import { Copy, LogOut } from "lucide-react";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const { address, disconnect } = useWallet();
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!mounted) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your FragmentFi account and preferences.</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Account Details</h2>
        
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Connected Wallet</label>
            <div className="flex items-center gap-2">
              <code className="bg-muted px-3 py-2 rounded-md flex-1 text-sm overflow-hidden text-ellipsis">
                {address || "Not connected"}
              </code>
              <button
                onClick={handleCopy}
                disabled={!address}
                className="p-2 bg-muted hover:bg-muted/80 rounded-md transition-colors"
                title="Copy Address"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            {copied && <p className="text-xs text-green-500 mt-1">Copied to clipboard!</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Network</label>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <span className="text-sm font-medium">Stellar Testnet</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <button
            onClick={disconnect}
            className="flex items-center justify-center w-full gap-2 px-4 py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-md transition-colors font-medium"
          >
            <LogOut className="h-4 w-4" />
            Disconnect Wallet
          </button>
        </div>
      </div>
    </div>
  );
}
