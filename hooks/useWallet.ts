"use client";

import { useState, useCallback, useEffect } from 'react';
import { requestAccess, signTransaction } from '@stellar/freighter-api';

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(true); // start true while we check session

  // On mount: restore session from the httpOnly cookie via /api/me
  // This is the source of truth — independent of Freighter's isConnected()
  useEffect(() => {
    fetch('/api/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.address) setAddress(data.address);
      })
      .catch((e) => console.warn('Session restore failed:', e))
      .finally(() => setIsConnecting(false));
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      // requestAccess prompts Freighter — works whether or not already connected
      const accessRes: any = await requestAccess();
      const pubKey =
        typeof accessRes === 'string'
          ? accessRes
          : accessRes?.address ?? null;

      if (!pubKey || typeof pubKey !== 'string') {
        alert('Could not get wallet address. Please unlock Freighter and try again.');
        return;
      }

      // Verify with backend — now DB-independent, always instant
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: pubKey }),
      });

      if (res.ok) {
        setAddress(pubKey);
        window.location.replace('/dashboard');
      } else {
        const err = await res.json().catch(() => ({}));
        console.error('Auth failed:', err);
        alert('Wallet verification failed. Please try again.');
      }
    } catch (e: any) {
      if (e?.message?.toLowerCase().includes('declined') || e?.message?.toLowerCase().includes('rejected')) {
        alert('You declined the connection request in Freighter.');
      } else {
        console.error('Connect error:', e);
        alert('Failed to connect. Is Freighter installed and unlocked?');
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
    window.location.replace('/');
  }, []);

  return { address, isConnecting, connect, disconnect, signTransaction };
}
