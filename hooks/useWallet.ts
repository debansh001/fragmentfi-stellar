"use client";

import { useState, useCallback, useEffect } from 'react';
import { 
  isConnected, 
  getAddress, 
  requestAccess, 
  signMessage,
  signTransaction
} from '@stellar/freighter-api';

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Check if wallet is already connected
    const checkConnection = async () => {
      try {
        if (await isConnected()) {
          const pubKeyRes: any = await getAddress();
          const pubKey = typeof pubKeyRes === 'string' ? pubKeyRes : pubKeyRes?.address;
          if (pubKey && typeof pubKey === 'string') setAddress(pubKey);
        }
      } catch (e) {
        console.error("Failed to get address automatically", e);
      }
    };
    checkConnection();
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      if (await isConnected()) {
        const pubKeyRes: any = await requestAccess();
        const pubKey = typeof pubKeyRes === 'string' ? pubKeyRes : pubKeyRes?.address;
        if (pubKey && typeof pubKey === 'string') {
          // Authentication message
          const message = `Sign this message to verify your wallet for FragmentFi: ${Date.now()}`;
          const sigResult = await signMessage(message, { network: 'TESTNET' }) as any;
          
          let signatureStr = "";
          if (typeof sigResult === 'string') {
            signatureStr = sigResult;
          } else if (sigResult instanceof Uint8Array) {
            signatureStr = btoa(String.fromCharCode.apply(null, Array.from(sigResult)));
          } else if (sigResult?.signature) {
            if (typeof sigResult.signature === 'string') {
              signatureStr = sigResult.signature;
            } else if (sigResult.signature instanceof Uint8Array) {
              signatureStr = btoa(String.fromCharCode.apply(null, Array.from(sigResult.signature)));
            }
          }

          // Send to API
          const res = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: pubKey, message, signature: signatureStr })
          });

          if (res.ok) {
            setAddress(pubKey);
            window.location.href = '/dashboard';
          } else {
            console.error("Verification failed");
          }
        }
      } else {
        alert('Please install Freighter extension.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setAddress(null);
    window.location.href = '/';
  }, []);

  return {
    address,
    isConnecting,
    connect,
    disconnect,
    signTransaction
  };
}
