"use client";

import Link from "next/link";
import { ArrowRight, GitCommitHorizontal, Plus } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader, StatCard, StatusBadge } from "@/components/shared";
import { deployments, requestSeries } from "@/lib/data";
import { useStore } from "@/lib/store";
import { compactNumber, relativeTime } from "@/lib/format";

const chartConfig = {
  requests: { label: "Requests", color: "var(--chart-1)" },
  errors: { label: "Errors", color: "var(--chart-5)" },
} satisfies ChartConfig;

export default function OverviewPage() {
  const { state } = useStore();
  const totalRequests = state.projects.reduce((a, p) => a + p.requests24h, 0);
  const openIncidents = state.incidents.filter((i) => i.status !== "resolved");
  const healthy = state.projects.filter((p) => p.status === "healthy").length;

  return (
    <>
      <PageHeader
        title="Overview"
        description="Everything happening across Orbit Labs in the last 24 hours."
        actions={
          <>
            <Button variant="outline" render={<Link href="/projects" />}>
              View projects
            </Button>
            <Button render={<Link href="/projects?new=1" />}>
              <Plus data-icon="inline-start" /> New project
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" data-testid="overview-stats">
        <StatCard label="Requests (24h)" value={compactNumber(totalRequests)} delta="+8.4%" deltaTone="up" hint="vs. previous 24h" />
        <StatCard label="Error rate" value="1.9%" delta="+1.6 pts" deltaTone="down" hint="Driven by ingest-pipeline" />
        <StatCard label="p95 latency" value="284 ms" delta="-12 ms" deltaTone="up" hint="Across all production services" />
        <StatCard
          label="Healthy projects"
          value={`${healthy} / ${state.projects.length}`}
          delta={openIncidents.length > 0 ? `${openIncidents.length} open incidents` : "All clear"}
          deltaTone={openIncidents.length > 0 ? "down" : "up"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Traffic</CardTitle>
            <CardDescription>Requests and errors per hour, all production projects</CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" render={<Link href="/usage" />}>
                Usage <ArrowRight data-icon="inline-end" />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <AreaChart data={requestSeries} margin={{ left: 0, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="fillRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-requests)" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="var(--color-requests)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => compactNumber(v)} width={48} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                <Area dataKey="requests" type="monotone" fill="url(#fillRequests)" stroke="var(--color-requests)" strokeWidth={2} />
                <Area dataKey="errors" type="monotone" fill="var(--color-errors)" fillOpacity={0.3} stroke="var(--color-errors)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active incidents</CardTitle>
            <CardDescription>{openIncidents.length} requiring attention</CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" render={<Link href="/incidents" />}>
                All <ArrowRight data-icon="inline-end" />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-3">
            {openIncidents.length === 0 && <p className="text-sm text-muted-foreground">No open incidents.</p>}
            {openIncidents.map((i) => (
              <Link
                key={i.id}
                href={`/incidents?focus=${i.id}`}
                className="block rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <StatusBadge status={i.severity} dot={false} />
                  <StatusBadge status={i.status} dot={false} />
                  <span className="ml-auto text-xs text-muted-foreground">{relativeTime(i.startedAt)}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-medium">{i.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {i.service} · {i.assignee ?? "Unassigned"}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent deployments</CardTitle>
            <CardDescription>Latest builds across all projects</CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" render={<Link href="/deployments" />}>
                All <ArrowRight data-icon="inline-end" />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Commit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deployments.slice(0, 6).map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>
                      <Link href={`/deployments/${d.id}`} className="font-medium hover:underline">
                        {d.projectSlug}
                      </Link>
                      <span className="ml-2 text-xs text-muted-foreground">{d.environment}</span>
                    </TableCell>
                    <TableCell className="max-w-[260px]">
                      <div className="flex items-center gap-1.5">
                        <GitCommitHorizontal className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="font-mono text-xs">{d.commit}</span>
                        <span className="truncate text-muted-foreground">{d.message}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={d.status} />
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{relativeTime(d.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Project health</CardTitle>
            <CardDescription>Error rate and p95 by project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {state.projects
              .filter((p) => p.status !== "paused" && p.requests24h > 0)
              .map((p) => (
                <Link
                  key={p.slug}
                  href={`/projects/${p.slug}`}
                  className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/50"
                >
                  <StatusBadge status={p.status} className="w-24 justify-start" />
                  <span className="flex-1 truncate text-sm font-medium">{p.name}</span>
                  <span className="w-14 text-right text-xs tabular-nums text-muted-foreground">{p.errorRate.toFixed(2)}%</span>
                  <span className="w-16 text-right text-xs tabular-nums text-muted-foreground">{p.p95Ms} ms</span>
                </Link>
              ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
