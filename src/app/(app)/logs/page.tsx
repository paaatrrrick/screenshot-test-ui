"use client";

import * as React from "react";
import { ChevronDown, ChevronRight, Pause, Play, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CopyButton, PageHeader } from "@/components/shared";
import { logs, type LogLevel } from "@/lib/data";
import { formatDateTime } from "@/lib/format";

const levels: LogLevel[] = ["debug", "info", "warn", "error"];
const services = ["atlas-api", "atlas-web", "billing-worker", "ingest-pipeline", "mobile-gateway"];

const levelBadge: Record<LogLevel, string> = {
  debug: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
  info: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  warn: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  error: "bg-red-500/10 text-red-700 dark:text-red-400",
};

export default function LogsPage() {
  const [query, setQuery] = React.useState("");
  const [activeLevels, setActiveLevels] = React.useState<LogLevel[]>(levels);
  const [service, setService] = React.useState("all");
  const [range, setRange] = React.useState("1h");
  const [live, setLive] = React.useState(true);
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());

  const filtered = logs.filter(
    (l) =>
      activeLevels.includes(l.level) &&
      (service === "all" || l.service === service) &&
      (query === "" || l.message.toLowerCase().includes(query.toLowerCase()) || l.requestId.includes(query)),
  );

  const toggle = (id: string) =>
    setExpanded((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const counts = levels.reduce((acc, l) => ({ ...acc, [l]: logs.filter((x) => x.level === l).length }), {} as Record<LogLevel, number>);

  return (
    <>
      <PageHeader
        title="Logs"
        description="Structured logs from every service, streamed in real time."
        actions={
          <>
            <Button variant="outline" onClick={() => toast("AI summary", { description: "3 error clusters: invoice totals (12), Kafka lag (8), Postgres reconnects (5)." })}>
              <Sparkles data-icon="inline-start" /> Summarize errors
            </Button>
            <Button variant={live ? "default" : "outline"} onClick={() => setLive(!live)} data-testid="live-toggle">
              {live ? <Pause data-icon="inline-start" /> : <Play data-icon="inline-start" />}
              {live ? "Live" : "Paused"}
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-2 lg:flex-row lg:items-center" data-testid="logs-filter-bar">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder='Search messages or request IDs, e.g. "invoice" or req_9a3f'
            className="pl-8 font-mono text-xs"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            Levels
            <Badge variant="secondary" className="ml-1">
              {activeLevels.length}
            </Badge>
            <ChevronDown data-icon="inline-end" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            <DropdownMenuLabel>Show levels</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {levels.map((l) => (
              <DropdownMenuCheckboxItem
                key={l}
                checked={activeLevels.includes(l)}
                onCheckedChange={(c) => setActiveLevels((s) => (c ? [...s, l] : s.filter((x) => x !== l)))}
                closeOnClick={false}
              >
                <span className="capitalize">{l}</span>
                <span className="ml-auto text-xs text-muted-foreground">{counts[l]}</span>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Select value={service} onValueChange={(v) => setService(v as string)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All services</SelectItem>
            {services.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={range} onValueChange={(v) => setRange(v as string)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="15m">Last 15 min</SelectItem>
            <SelectItem value="1h">Last hour</SelectItem>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {live && <span className="size-2 animate-pulse rounded-full bg-emerald-500" />}
        {filtered.length} events · {live ? "streaming" : "paused"}
      </div>

      <Card className="overflow-hidden py-0">
        <div className="grid grid-cols-[24px_150px_64px_128px_1fr] items-center gap-2 border-b bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <span />
          <span>Timestamp</span>
          <span>Level</span>
          <span>Service</span>
          <span>Message</span>
        </div>
        <div className="max-h-[640px] overflow-auto font-mono text-xs" data-testid="log-rows">
          {filtered.map((l) => {
            const open = expanded.has(l.id);
            return (
              <div key={l.id} className="border-b last:border-0" data-log-id={l.id}>
                <button
                  type="button"
                  className={cn(
                    "grid w-full grid-cols-[24px_150px_64px_128px_1fr] items-center gap-2 px-3 py-1.5 text-left hover:bg-muted/50",
                    l.level === "error" && "bg-red-500/5",
                    open && "bg-muted/60",
                  )}
                  onClick={() => toggle(l.id)}
                  aria-expanded={open}
                >
                  <span className="text-muted-foreground">{open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}</span>
                  <span className="text-muted-foreground">{formatDateTime(l.ts)}</span>
                  <span>
                    <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase", levelBadge[l.level])}>{l.level}</span>
                  </span>
                  <span className="truncate text-muted-foreground">{l.service}</span>
                  <span className="truncate">{l.message}</span>
                </button>
                {open && (
                  <div className="grid gap-3 border-t bg-muted/30 px-3 py-3 lg:grid-cols-[1fr_260px]" data-testid="log-detail">
                    <pre className="overflow-auto rounded-lg bg-zinc-950 p-3 text-[11px] leading-relaxed text-zinc-100">
                      {JSON.stringify({ ts: l.ts, level: l.level, service: l.service, requestId: l.requestId, message: l.message, ...l.meta }, null, 2)}
                    </pre>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Request ID</span>
                        <span className="flex items-center gap-1">
                          {l.requestId} <CopyButton value={l.requestId} />
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Host</span>
                        <span>{String(l.meta.host)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Region</span>
                        <span>{String(l.meta.region)}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Tooltip>
                          <TooltipTrigger render={<Button variant="outline" size="xs" onClick={() => setQuery(l.requestId)} />}>
                            Filter by request
                          </TooltipTrigger>
                          <TooltipContent>Show every log line for {l.requestId}</TooltipContent>
                        </Tooltip>
                        <Button variant="outline" size="xs" onClick={() => toast("Opened in trace viewer")}>
                          View trace
                        </Button>
                        {l.level === "error" && (
                          <Button variant="outline" size="xs" onClick={() => toast.success("Incident created from log")}>
                            Create incident
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && <p className="py-12 text-center text-muted-foreground">No log events match the current filters.</p>}
        </div>
      </Card>
    </>
  );
}
