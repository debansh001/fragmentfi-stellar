"use client";

import React, { useState, useEffect, useCallback } from 'react';
import StatCard from '@/components/StatCard';
import FilterBar, { FilterType } from '@/components/FilterBar';
import TransactionTable from '@/components/TransactionTable';

export default function HistoryPage() {
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('page', page.toString());
      params.append('limit', '10');

      const res = await fetch(`/api/history?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, startDate, endDate, page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleExport = () => {
    const params = new URLSearchParams();
    if (typeFilter !== 'all') params.append('type', typeFilter);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('export', 'true');
    
    // Trigger download
    window.location.href = `/api/history?${params.toString()}`;
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(p => p - 1);
  };

  const handleNextPage = () => {
    if (data?.pagination && page < data.pagination.totalPages) {
      setPage(p => p + 1);
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [typeFilter, startDate, endDate]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto py-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
        <p className="text-muted-foreground mt-1">
          Review all your past deposits, withdrawals, and yield distributions.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          label="Total Deposited" 
          value={data?.summary?.totalDeposited?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'} 
          prefix="$"
        />
        <StatCard 
          label="Total Withdrawn" 
          value={data?.summary?.totalWithdrawn?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'} 
          prefix="$"
        />
        <StatCard 
          label="Total Yield Earned" 
          value={data?.summary?.totalYieldFrag?.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 }) || '0.0000'} 
          suffix=" FRAG"
        />
      </div>

      <div>
        <FilterBar 
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          onExport={handleExport}
        />
        
        <TransactionTable 
          transactions={data?.transactions || []} 
          loading={loading} 
        />

        {/* Pagination Controls */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-2 py-4 mt-4">
            <span className="text-sm text-muted-foreground">
              Showing page {data.pagination.page} of {data.pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={handlePrevPage}
                disabled={page === 1}
                className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-muted focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              >
                Previous
              </button>
              <button 
                onClick={handleNextPage}
                disabled={page === data.pagination.totalPages}
                className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-muted focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
