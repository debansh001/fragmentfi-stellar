"use client";

import React from 'react';

export type WalletType = 'freighter' | 'albedo';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (wallet: WalletType) => void;
  isConnecting: boolean;
}

export default function WalletConnectModal({ isOpen, onClose, onConnect, isConnecting }: WalletConnectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          disabled={isConnecting}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-xl font-bold mb-2 text-foreground">Connect Wallet</h2>
        <p className="text-sm text-muted-foreground mb-6">Choose how you want to connect to FragmentFi.</p>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={() => onConnect('freighter')}
            disabled={isConnecting}
            className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-4 hover:bg-muted/80 transition-colors disabled:opacity-50 text-left"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background border border-border text-lg shadow-sm">
              🚢
            </div>
            <div>
              <div className="font-semibold text-foreground">Freighter</div>
              <div className="text-xs text-muted-foreground">Browser Extension (Desktop)</div>
            </div>
          </button>
          
          <button
            onClick={() => onConnect('albedo')}
            disabled={isConnecting}
            className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-4 hover:bg-muted/80 transition-colors disabled:opacity-50 text-left"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background border border-border text-lg shadow-sm">
              ☀️
            </div>
            <div>
              <div className="font-semibold text-foreground">Albedo</div>
              <div className="text-xs text-muted-foreground">Web Intent (Mobile & Web)</div>
            </div>
          </button>
        </div>
        
        {isConnecting && (
          <div className="mt-4 text-center text-sm font-medium text-primary animate-pulse">
            Connecting...
          </div>
        )}
      </div>
    </div>
  );
}
