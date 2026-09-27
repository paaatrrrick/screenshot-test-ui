"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, MoreHorizontal, Pause, Play, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EmptyState, PageHeader, StatCard, StatusBadge } from "@/components/shared";
import { useStore } from "@/lib/store";
import { relativeTime } from "@/lib/format";

export default function MonitorsPage() {
  const router = useRouter();
  const { state, dispatch } = useStore();
  const monitors = state.monitors;
  const up = monitors.filter((m) => m.status === "up").length;
  const down = monitors.filter((m) => m.status === "down").length;

  return (
    <>
      <PageHeader
        title="Monitors"
        description="Synthetic uptime checks from multiple regions."
        actions={
          <Button render={<Link href="/monitors/new" />} data-testid="create-monitor">
            <Plus data-icon="inline-start" /> Create monitor
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Monitors" value={monitors.length} />
        <StatCard label="Up" value={up} deltaTone="up" />
        <StatCard label="Down" value={down} delta={down > 0 ? "Needs attention" : undefined} deltaTone="down" />
        <StatCard label="Avg. uptime (30d)" value="99.63%" />
      </div>

      {monitors.length === 0 ? (
        <EmptyState icon={Activity} title="No monitors" description="Create a monitor to get alerted when an endpoint goes down." />
      ) : (
        <Card className="py-0">
          <Table data-testid="monitors-table">
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Monitor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uptime (30d)</TableHead>
                <TableHead>Latency</TableHead>
                <TableHead>Interval</TableHead>
                <TableHead>Regions</TableHead>
                <TableHead className="text-right">Last check</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {monitors.map((m) => (
                <TableRow key={m.id} className="cursor-pointer" onClick={() => router.push(`/monitors/${m.id}`)}>
                  <TableCell className="pl-4">
                    <div className="font-medium">{m.name}</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {m.method} {m.url}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={m.status} />
                  </TableCell>
                  <TableCell className="tabular-nums">{m.status === "paused" ? "—" : `${m.uptime30d.toFixed(2)}%`}</TableCell>
                  <TableCell className="tabular-nums">{m.status === "paused" ? "—" : `${m.avgLatencyMs} ms`}</TableCell>
                  <TableCell className="text-muted-foreground">{m.intervalSec}s</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {m.regions.map((r) => (
                        <Badge key={r} variant="outline" className="font-mono text-[10px]">
                          {r}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{relativeTime(m.lastCheckedAt)}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Monitor actions" />}>
                        <MoreHorizontal />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => dispatch({ type: "monitor.toggle", id: m.id })}>
                          {m.status === "paused" ? <Play /> : <Pause />}
                          {m.status === "paused" ? "Resume" : "Pause"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast("Check triggered")}>Run check now</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => {
                            dispatch({ type: "monitor.delete", id: m.id });
                            toast(`Deleted ${m.name}`);
                          }}
                        >
                          <Trash2 /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </>
  );
}
