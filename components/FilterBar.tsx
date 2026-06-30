"use client";

import React from 'react';

export type FilterType = 'all' | 'deposit' | 'withdrawal' | 'yield';

interface FilterBarProps {
  typeFilter: FilterType;
  setTypeFilter: (val: FilterType) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  onExport: () => void;
}

export default function FilterBar({
  typeFilter,
  setTypeFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onExport
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-background border border-border p-4 rounded-xl shadow-sm mb-6">
      <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
        <div className="flex flex-col gap-1.5 w-full sm:w-auto">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Transaction Type</label>
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as FilterType)}
            className="h-9 px-3 rounded-md border border-input bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All Types</option>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="yield">Yield</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5 flex-1 sm:flex-none">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Start Date</label>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-9 px-3 rounded-md border border-input bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex flex-col gap-1.5 flex-1 sm:flex-none">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">End Date</label>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-9 px-3 rounded-md border border-input bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      <button 
        onClick={onExport}
        className="w-full sm:w-auto inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" x2="12" y1="15" y2="3" />
        </svg>
        Export CSV
      </button>
    </div>
  );
}
