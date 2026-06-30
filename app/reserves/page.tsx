"use client";

import React, { useEffect, useState } from 'react';
import ReserveGauge from '@/components/ReserveGauge';
import SupplyChart from '@/components/SupplyChart';
import AuditLog from '@/components/AuditLog';
import StatCard from '@/components/StatCard';

interface ReservesData {
  reserves: {
    totalReservesUsd: number;
    onChainReservesXlm: number;
    onChainReservesUsdc: number;
  };
  supply: {
    totalFragSupply: number;
    supplyUsdValue: number;
  };
  reserveRatio: number;
  auditLogs: any[];
}

export default function ReservesPage() {
  const [data, setData] = useState<ReservesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReserves() {
      try {
        const res = await fetch('/api/reserves');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Failed to load reserves:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReserves();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold">Failed to load reserves data</h2>
        <p className="text-muted-foreground">Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto py-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Proof of Reserves</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl">
          FragmentFi maintains 1:1 transparent backing. All assets are held in a secure Soroban smart contract, verifiable on the Stellar network at any time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Supply" 
          value={data.supply.totalFragSupply.toLocaleString(undefined, { maximumFractionDigits: 0 })} 
          suffix=" FRAG"
        />
        <StatCard 
          label="Total Backing" 
          value={data.reserves.totalReservesUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })} 
          prefix="$"
        />
        <StatCard 
          label="USDC Reserves" 
          value={data.reserves.onChainReservesUsdc.toLocaleString(undefined, { maximumFractionDigits: 0 })} 
          prefix="$"
        />
        <StatCard 
          label="XLM Reserves" 
          value={data.reserves.onChainReservesXlm.toLocaleString(undefined, { maximumFractionDigits: 0 })} 
          suffix=" XLM"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ReserveGauge ratio={data.reserveRatio} />
        </div>
        <div className="lg:col-span-2">
          <SupplyChart currentSupply={data.supply.totalFragSupply} />
        </div>
      </div>

      <div className="mt-4">
        <AuditLog logs={data.auditLogs} />
      </div>
    </div>
  );
}
