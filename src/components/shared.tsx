"use client";

import * as React from "react";
import { cn } from "cn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="min-w-0 space-y-1">
        <h1 className="truncate text-xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

const statusStyles: Record<string, string> = {
  healthy: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  ready: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  up: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  resolved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  degraded: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  building: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  queued: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  acknowledged: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  invited: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  down: "bg-red-500/10 text-red-700 dark:text-red-400",
  error: "bg-red-500/10 text-red-700 dark:text-red-400",
  failed: "bg-red-500/10 text-red-700 dark:text-red-400",
  open: "bg-red-500/10 text-red-700 dark:text-red-400",
  suspended: "bg-red-500/10 text-red-700 dark:text-red-400",
  paused: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
  canceled: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
  critical: "bg-red-600 text-white dark:bg-red-500",
  high: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
  medium: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  low: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
  production: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  preview: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  staging: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  development: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
};

const dotStyles: Record<string, string> = {
  healthy: "bg-emerald-500",
  ready: "bg-emerald-500",
  up: "bg-emerald-500",
  degraded: "bg-amber-500",
  building: "bg-blue-500 animate-pulse",
  queued: "bg-slate-400",
  down: "bg-red-500",
  error: "bg-red-500",
  paused: "bg-slate-400",
  canceled: "bg-slate-400",
};

export function StatusBadge({ status, className, dot = true }: { status: string; className?: string; dot?: boolean }) {
  return (
    <Badge variant="secondary" className={cn("capitalize", statusStyles[status], className)} data-status={status}>
      {dot && dotStyles[status] && <span className={cn("size-1.5 rounded-full", dotStyles[status])} />}
      {status}
    </Badge>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Icon className="size-5 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="font-medium">{title}</p>
          <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}

export function StatCard({
  label,
  value,
  delta,
  deltaTone = "neutral",
  hint,
}: {
  label: string;
  value: React.ReactNode;
  delta?: string;
  deltaTone?: "up" | "down" | "neutral";
  hint?: string;
}) {
  return (
    <Card size="sm">
      <CardContent className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-semibold tabular-nums">{value}</p>
          {delta && (
            <span
              className={cn(
                "text-xs font-medium",
                deltaTone === "up" && "text-emerald-600 dark:text-emerald-400",
                deltaTone === "down" && "text-red-600 dark:text-red-400",
                deltaTone === "neutral" && "text-muted-foreground",
              )}
            >
              {delta}
            </span>
          )}
        </div>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <Button
      variant="ghost"
      size="icon-xs"
      aria-label={label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
        } catch {}
        setCopied(true);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check className="text-emerald-600" /> : <Copy />}
    </Button>
  );
}

export function Mono({ children, className }: { children: React.ReactNode; className?: string }) {
  return <code className={cn("rounded bg-muted px-1.5 py-0.5 font-mono text-xs", className)}>{children}</code>;
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">{children}</kbd>;
}
