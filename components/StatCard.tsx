import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  prefix?: string;
  suffix?: string;
}

export default function StatCard({ label, value, change, changeLabel, prefix = "", suffix = "" }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-background p-6 shadow-sm">
      <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-foreground">
          {prefix}{value}{suffix}
        </span>
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-1.5 text-sm mt-1">
          <span className={`inline-flex items-center font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {isPositive ? '↑' : '↓'} {Math.abs(change)}%
          </span>
          {changeLabel && <span className="text-muted-foreground">{changeLabel}</span>}
        </div>
      )}
    </div>
  );
}
