"use client";

import React from 'react';

interface ReserveGaugeProps {
  ratio: number;
}

export default function ReserveGauge({ ratio }: ReserveGaugeProps) {
  // Cap at 150% for the gauge display
  const displayRatio = Math.min(ratio, 150);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (displayRatio / 100) * circumference;

  // Color logic
  const isHealthy = ratio >= 100;
  const strokeColor = isHealthy ? "text-green-500" : "text-amber-500";
  const statusText = isHealthy ? "Overcollateralized" : "Undercollateralized";

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-border bg-background shadow-sm">
      <h3 className="text-lg font-semibold text-foreground mb-1">Live Reserve Ratio</h3>
      <p className="text-sm text-muted-foreground mb-6 text-center">On-chain assets vs minted FRAG</p>

      <div className="relative flex items-center justify-center w-48 h-48">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            className="text-muted stroke-current"
            strokeWidth="8"
            cx="50"
            cy="50"
            r="45"
            fill="transparent"
          ></circle>
          <circle
            className={`${strokeColor} stroke-current transition-all duration-1000 ease-in-out`}
            strokeWidth="8"
            strokeLinecap="round"
            cx="50"
            cy="50"
            r="45"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset < 0 ? 0 : strokeDashoffset}
          ></circle>
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-foreground">{ratio.toFixed(1)}%</span>
        </div>
      </div>

      <div className={`mt-6 px-4 py-1.5 rounded-full text-sm font-medium border ${isHealthy ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'}`}>
        {statusText}
      </div>
    </div>
  );
}
