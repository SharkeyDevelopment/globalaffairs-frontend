import { useState, useEffect } from 'react';
import { api, type Usage } from '@/lib/api';

function Meter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = Math.round((used / limit) * 100);
  const exhausted = used >= limit;

  return (
    <div className="flex items-center gap-1.5">
      <span>{label}:</span>
      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${exhausted ? 'bg-destructive' : 'bg-primary'}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className={exhausted ? 'text-destructive font-medium' : ''}>
        {used}/{limit}
      </span>
    </div>
  );
}

export function UsageBanner() {
  const [usage, setUsage] = useState<Usage | null>(null);

  useEffect(() => {
    api.getUsage().then(setUsage).catch(() => {});
    const interval = setInterval(() => {
      api.getUsage().then(setUsage).catch(() => {});
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (!usage) return null;

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
      <span className="font-medium text-foreground/80">Demo Daily Limits</span>
      <Meter label="AI queries" used={usage.aiRequests} limit={usage.aiLimit} />
      <Meter label="Uploads" used={usage.uploads} limit={usage.uploadLimit} />
      <Meter label="Deletes" used={usage.deletes} limit={usage.deleteLimit} />
    </div>
  );
}
