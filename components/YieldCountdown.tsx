"use client";

import React, { useState, useEffect } from 'react';

interface YieldCountdownProps {
  estimatedAmount: number;
}

export default function YieldCountdown({ estimatedAmount }: YieldCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Mock next payout time (e.g. next Friday at 12:00 UTC) or just 24 hours from now
    const getNextPayoutTime = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0); // Midnight UTC next day for mock
      return tomorrow.getTime();
    };

    const payoutTime = getNextPayoutTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = payoutTime - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-gradient-to-br from-primary/10 to-background p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Next Yield Payout</h3>
        <p className="text-sm text-muted-foreground">Estimated distribution time</p>
      </div>

      <div className="flex items-center gap-4 py-2">
        <div className="flex flex-col items-center justify-center rounded-lg bg-background border border-border px-4 py-2 min-w-[70px]">
          <span className="text-2xl font-bold text-primary">{timeLeft.hours.toString().padStart(2, '0')}</span>
          <span className="text-xs text-muted-foreground uppercase font-medium">Hours</span>
        </div>
        <span className="text-2xl font-bold text-muted-foreground">:</span>
        <div className="flex flex-col items-center justify-center rounded-lg bg-background border border-border px-4 py-2 min-w-[70px]">
          <span className="text-2xl font-bold text-primary">{timeLeft.minutes.toString().padStart(2, '0')}</span>
          <span className="text-xs text-muted-foreground uppercase font-medium">Mins</span>
        </div>
        <span className="text-2xl font-bold text-muted-foreground">:</span>
        <div className="flex flex-col items-center justify-center rounded-lg bg-background border border-border px-4 py-2 min-w-[70px]">
          <span className="text-2xl font-bold text-primary">{timeLeft.seconds.toString().padStart(2, '0')}</span>
          <span className="text-xs text-muted-foreground uppercase font-medium">Secs</span>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-4">
        <span className="text-sm font-medium text-muted-foreground">Estimated Amount:</span>
        <span className="text-lg font-bold text-foreground">
          +{estimatedAmount.toFixed(2)} FRAG
        </span>
      </div>
    </div>
  );
}
