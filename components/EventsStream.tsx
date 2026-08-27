import React, { useEffect, useState } from 'react';

interface SorobanEvent {
  id: string;
  contractId: string;
  ledger: number;
  type: string;
  topic: string;
  valueXdr: string;
}

export default function EventsStream() {
  const [events, setEvents] = useState<SorobanEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events');
        if (res.ok) {
          const data = await res.json();
          if (mounted) setEvents(data.events || []);
        }
      } catch (err) {
        console.error('Failed to fetch events', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 10000); // refresh every 10s
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) return <div className="text-sm text-muted-foreground p-4">Loading on-chain events...</div>;

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          Live Soroban Events (Level 5 Audit)
        </h3>
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">Auto-updating</span>
      </div>
      
      {events.length > 0 ? (
        <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-2">
          {events.map((ev) => (
            <div key={ev.id} className="flex flex-col p-3 rounded-lg bg-background border border-border/50 text-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-xs font-semibold text-primary">Ledger: {ev.ledger}</span>
                <span className="text-xs text-muted-foreground font-mono">{ev.contractId.slice(0,8)}...{ev.contractId.slice(-4)}</span>
              </div>
              <div className="grid grid-cols-5 gap-2 text-xs">
                <div className="col-span-1 text-muted-foreground">Type:</div>
                <div className="col-span-4 font-medium">{ev.type}</div>
                
                <div className="col-span-1 text-muted-foreground">Topic:</div>
                <div className="col-span-4 font-mono truncate">{ev.topic || 'N/A'}</div>
                
                <div className="col-span-1 text-muted-foreground">Data:</div>
                <div className="col-span-4 font-mono truncate">{ev.valueXdr}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No recent contract events found on the network.
        </div>
      )}
    </div>
  );
}
