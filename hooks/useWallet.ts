"use client";

import { useState, useCallback, useEffect } from 'react';
import { requestAccess, signTransaction as freighterSignTransaction } from '@stellar/freighter-api';
import albedo from '@albedo-link/intent';

export type WalletType = 'freighter' | 'albedo' | null;

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [walletType, setWalletType] = useState<WalletType>(null);

  // Restore session from httpOnly cookie via /api/me
  useEffect(() => {
    const savedType = localStorage.getItem('fragmentfi_wallet_type') as WalletType;
    if (savedType) setWalletType(savedType);

    fetch('/api/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.address) setAddress(data.address);
      })
      .catch((e) => console.warn('Session restore failed:', e))
      .finally(() => setIsConnecting(false));
  }, []);

  const connect = useCallback(async (selectedWallet: 'freighter' | 'albedo') => {
    setIsConnecting(true);
    try {
      let pubKey: string | null = null;

      if (selectedWallet === 'freighter') {
        const accessRes: any = await requestAccess();
        pubKey = typeof accessRes === 'string' ? accessRes : accessRes?.address ?? null;
        
        if (!pubKey) {
          throw new Error('Could not get wallet address. Please unlock Freighter and try again.');
        }
      } else if (selectedWallet === 'albedo') {
        const res = await albedo.publicKey({});
        pubKey = res.pubkey;
        
        if (!pubKey) {
          throw new Error('Could not connect to Albedo.');
        }
      }

      if (!pubKey) return;

      // Verify with backend
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: pubKey }),
      });

      if (res.ok) {
        setAddress(pubKey);
        setWalletType(selectedWallet);
        localStorage.setItem('fragmentfi_wallet_type', selectedWallet);
        window.location.replace('/dashboard');
      } else {
        throw new Error('Wallet verification failed.');
      }
    } catch (e: any) {
      if (e?.message?.toLowerCase().includes('declined') || e?.message?.toLowerCase().includes('rejected') || e?.message?.toLowerCase().includes('closed')) {
        alert('You declined the connection request.');
      } else {
        console.error('Connect error:', e);
        alert(e.message || 'Failed to connect wallet.');
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Logout API call failed, clearing state anyway');
    }
    setAddress(null);
    setWalletType(null);
    localStorage.removeItem('fragmentfi_wallet_type');
    window.location.replace('/');
  }, []);

  const signTransaction = useCallback(async (xdr: string, opts?: any): Promise<{ signedTxXdr: string }> => {
    const currentWallet = walletType || localStorage.getItem('fragmentfi_wallet_type') || 'freighter';
    
    if (currentWallet === 'albedo') {
      const res = await albedo.tx({ xdr, network: 'testnet' });
      return { signedTxXdr: res.signed_envelope_xdr };
    } else {
      return freighterSignTransaction(xdr, opts);
    }
  }, [walletType]);

  return { address, isConnecting, connect, disconnect, signTransaction, walletType };
}
