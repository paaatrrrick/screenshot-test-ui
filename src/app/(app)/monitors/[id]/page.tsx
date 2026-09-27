"use client";

import { notFound, useParams } from "next/navigation";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mono, PageHeader, StatCard, StatusBadge } from "@/components/shared";
import { NOW } from "@/lib/data";
import { useStore } from "@/lib/store";
import { formatDateTime, relativeTime } from "@/lib/format";

const latencyConfig = { latency: { label: "Latency (ms)", color: "var(--chart-1)" } } satisfies ChartConfig;
const uptimeConfig = { uptime: { label: "Uptime %", color: "var(--chart-2)" } } satisfies ChartConfig;

export default function MonitorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useStore();
  const monitor = state.monitors.find((m) => m.id === id);
  if (!monitor) notFound();

  const down = monitor.status === "down";
  const latency = Array.from({ length: 48 }, (_, i) => ({
    time: `${String((new Date(NOW.getTime() - (47 - i) * 1800_000)).getUTCHours()).padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}`,
    latency: down && i > 44 ? 4_000 + i * 20 : monitor.avgLatencyMs + Math.round(Math.sin(i / 3) * monitor.avgLatencyMs * 0.2) + (i % 4) * 5,
  }));
  const uptime = Array.from({ length: 30 }, (_, i) => ({
    day: `${i + 1}`,
    uptime: down && i === 29 ? 62 : monitor.status === "degraded" && i % 9 === 0 ? 97.5 : i === 12 && monitor.uptime30d < 99.99 ? 99.2 : 100,
  }));
  const checks = Array.from({ length: 10 }, (_, i) => ({
    ts: new Date(NOW.getTime() - i * monitor.intervalSec * 1000).toISOString(),
    region: monitor.regions[i % monitor.regions.length],
    status: down ? 503 : monitor.expectedStatus,
    ms: down ? 4_800 + i * 12 : monitor.avgLatencyMs + (i % 3) * 11,
    ok: !down,
  }));

  return (
    <>
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            {monitor.name}
            <StatusBadge status={monitor.status} />
          </span>
        }
        description={
          <Mono>
            {monitor.method} {monitor.url}
          </Mono>
        }
        actions={
          <>
            <Button variant="outline" onClick={() => toast("Check triggered in all regions")}>
              Run check now
            </Button>
            <Button variant="outline" onClick={() => dispatch({ type: "monitor.toggle", id: monitor.id })}>
              {monitor.status === "paused" ? "Resume" : "Pause"}
            </Button>
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Uptime (30d)" value={`${monitor.uptime30d.toFixed(2)}%`} />
        <StatCard label="Avg. latency" value={`${monitor.avgLatencyMs} ms`} hint={`Threshold ${monitor.thresholdMs} ms`} />
        <StatCard label="Interval" value={`${monitor.intervalSec}s`} hint={`${monitor.regions.length} regions`} />
        <StatCard label="Last check" value={relativeTime(monitor.lastCheckedAt)} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Response time</CardTitle>
            <CardDescription>Last 24 hours, averaged across regions</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={latencyConfig} className="h-56 w-full">
              <LineChart data={latency} margin={{ left: 0, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="time" tickLine={false} axisLine={false} minTickGap={40} />
                <YAxis tickLine={false} axisLine={false} width={44} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line dataKey="latency" type="monotone" stroke="var(--color-latency)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Daily uptime</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={uptimeConfig} className="h-56 w-full">
              <BarChart data={uptime} margin={{ left: 0, right: 0, top: 8 }}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} hide />
                <YAxis domain={[0, 100]} hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="uptime" fill="var(--color-uptime)" radius={2} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Time</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-4 text-right">Latency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {checks.map((c, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-4 font-mono text-xs">{formatDateTime(c.ts)}</TableCell>
                  <TableCell className="font-mono text-xs">{c.region}</TableCell>
                  <TableCell>
                    <span className={cn("font-mono text-xs font-medium", c.ok ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                      {c.status}
                    </span>
                  </TableCell>
                  <TableCell className={cn("pr-4 text-right tabular-nums", c.ms > monitor.thresholdMs && "text-red-600 dark:text-red-400")}>{c.ms} ms</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Expected status</dt>
                <dd className="font-mono">{monitor.expectedStatus}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Latency threshold</dt>
                <dd>{monitor.thresholdMs} ms</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Regions</dt>
                <dd className="flex flex-wrap justify-end gap-1">
                  {monitor.regions.map((r) => (
                    <Badge key={r} variant="outline" className="font-mono text-[10px]">
                      {r}
                    </Badge>
                  ))}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Alerts</dt>
                <dd className="text-right">{monitor.alertChannels.length ? monitor.alertChannels.join(", ") : "None"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
