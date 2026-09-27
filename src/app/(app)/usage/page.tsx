"use client";

import * as React from "react";
import Link from "next/link";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader, StatCard } from "@/components/shared";
import { org, usageSeries } from "@/lib/data";
import { useStore } from "@/lib/store";
import { compactNumber, formatDate } from "@/lib/format";

const trafficConfig = {
  requests: { label: "Requests (M)", color: "var(--chart-1)" },
  bandwidth: { label: "Bandwidth (GB)", color: "var(--chart-2)" },
} satisfies ChartConfig;
const buildConfig = { buildMinutes: { label: "Build minutes", color: "var(--chart-3)" } } satisfies ChartConfig;

const quotas = [
  { label: "Requests", used: 612, total: 1000, unit: "M" },
  { label: "Bandwidth", used: 1_640, total: 2_000, unit: "GB" },
  { label: "Build minutes", used: 4_120, total: 6_000, unit: "min" },
  { label: "Log retention", used: 28, total: 30, unit: "days" },
  { label: "Monitors", used: 7, total: 25, unit: "" },
  { label: "Seats", used: org.seats.used, total: org.seats.total, unit: "" },
];

export default function UsagePage() {
  const { state } = useStore();
  const [range, setRange] = React.useState("30d");

  return (
    <>
      <PageHeader
        title="Usage"
        description={`Billing period Sep 1 – Sep 30, 2026 · renews ${formatDate(org.renewsAt)}`}
        actions={
          <>
            <Select value={range} onValueChange={(v) => setRange(v as string)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="period">Billing period</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" render={<Link href="/settings?tab=billing" />}>
              Manage plan
            </Button>
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Estimated cost" value="$1,284" delta="+$96" deltaTone="neutral" hint="Includes $184 overage" />
        <StatCard label="Requests" value="612M" delta="+11%" deltaTone="neutral" hint="of 1B included" />
        <StatCard label="Bandwidth" value="1.64 TB" delta="+4%" deltaTone="neutral" hint="of 2 TB included" />
        <StatCard label="Build minutes" value={compactNumber(4120)} delta="-8%" deltaTone="up" hint="of 6,000 included" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Traffic</CardTitle>
            <CardDescription>Daily requests and bandwidth across all projects</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={trafficConfig} className="h-64 w-full" data-testid="usage-chart">
              <AreaChart data={usageSeries} margin={{ left: 0, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={32} />
                <YAxis tickLine={false} axisLine={false} width={36} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Area dataKey="requests" type="monotone" stroke="var(--color-requests)" fill="var(--color-requests)" fillOpacity={0.25} strokeWidth={2} />
                <Area dataKey="bandwidth" type="monotone" stroke="var(--color-bandwidth)" fill="var(--color-bandwidth)" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Plan limits</CardTitle>
            <CardDescription>{org.plan} plan</CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" render={<Link href="/settings?tab=billing" />}>
                Upgrade
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-4">
            {quotas.map((q) => {
              const pct = Math.round((q.used / q.total) * 100);
              return (
                <div key={q.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{q.label}</span>
                    <span className={pct >= 90 ? "font-medium text-amber-600 dark:text-amber-400" : "text-muted-foreground"}>
                      {compactNumber(q.used)}
                      {q.unit && ` ${q.unit}`} / {compactNumber(q.total)}
                      {q.unit && ` ${q.unit}`}
                    </span>
                  </div>
                  <Progress value={pct} />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Build minutes</CardTitle>
            <CardDescription>Per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={buildConfig} className="h-48 w-full">
              <BarChart data={usageSeries} margin={{ left: 0, right: 0, top: 8 }}>
                <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={48} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="buildMinutes" fill="var(--color-buildMinutes)" radius={2} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="py-0 lg:col-span-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Project</TableHead>
                <TableHead className="text-right">Requests</TableHead>
                <TableHead className="text-right">Bandwidth</TableHead>
                <TableHead className="text-right">Build min</TableHead>
                <TableHead className="pr-4 text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.projects
                .filter((p) => p.requests24h > 0)
                .map((p, i) => (
                  <TableRow key={p.slug}>
                    <TableCell className="pl-4 font-medium">
                      <Link href={`/projects/${p.slug}`} className="hover:underline">
                        {p.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{compactNumber(p.requests24h * 30)}</TableCell>
                    <TableCell className="text-right tabular-nums">{(p.requests24h / 8_000_000).toFixed(2)} TB</TableCell>
                    <TableCell className="text-right tabular-nums">{compactNumber(420 + i * 310)}</TableCell>
                    <TableCell className="pr-4 text-right tabular-nums">${compactNumber(Math.round(p.requests24h / 12_000) + 40)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </>
  );
}
