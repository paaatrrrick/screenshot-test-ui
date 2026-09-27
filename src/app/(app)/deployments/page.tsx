"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, GitCommitHorizontal, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader, StatusBadge } from "@/components/shared";
import { deployments } from "@/lib/data";
import { useStore } from "@/lib/store";
import { formatDuration, initials, relativeTime } from "@/lib/format";

const PAGE_SIZE = 8;

export default function DeploymentsPage() {
  const router = useRouter();
  const { state } = useStore();
  const [query, setQuery] = React.useState("");
  const [project, setProject] = React.useState("all");
  const [env, setEnv] = React.useState("all");
  const [status, setStatus] = React.useState("all");
  const [page, setPage] = React.useState(1);

  const filtered = deployments.filter(
    (d) =>
      (project === "all" || d.projectSlug === project) &&
      (env === "all" || d.environment === env) &&
      (status === "all" || d.status === status) &&
      (query === "" ||
        d.message.toLowerCase().includes(query.toLowerCase()) ||
        d.commit.includes(query) ||
        d.branch.includes(query) ||
        d.id.includes(query)),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <>
      <PageHeader title="Deployments" description="Every build across all projects and environments." />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by commit, branch, or message…"
            className="pl-8"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={project} onValueChange={(v) => { setProject(v as string); setPage(1); }}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {state.projects.map((p) => (
                <SelectItem key={p.slug} value={p.slug}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={env} onValueChange={(v) => { setEnv(v as string); setPage(1); }}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All environments</SelectItem>
              <SelectItem value="production">Production</SelectItem>
              <SelectItem value="preview">Preview</SelectItem>
              <SelectItem value="staging">Staging</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => { setStatus(v as string); setPage(1); }}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="building">Building</SelectItem>
              <SelectItem value="queued">Queued</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="py-0">
        <Table data-testid="deployments-table">
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Deployment</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Environment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="pr-4 text-right">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((d) => (
              <TableRow key={d.id} className="cursor-pointer" onClick={() => router.push(`/deployments/${d.id}`)}>
                <TableCell className="max-w-[360px] pl-4">
                  <div className="truncate font-medium">{d.message}</div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <GitCommitHorizontal className="size-3" />
                    <span className="font-mono">{d.commit}</span>
                    <span>·</span>
                    <span className="truncate">{d.branch}</span>
                  </div>
                </TableCell>
                <TableCell>{d.projectSlug}</TableCell>
                <TableCell>
                  <StatusBadge status={d.environment} dot={false} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={d.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="size-6">
                      <AvatarFallback className="text-[10px]">{initials(d.author)}</AvatarFallback>
                    </Avatar>
                    <span className="text-muted-foreground">{d.author}</span>
                  </div>
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">{formatDuration(d.durationSec)}</TableCell>
                <TableCell className="pr-4 text-right text-muted-foreground">{relativeTime(d.createdAt)}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  No deployments match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between border-t px-4 py-2 text-sm text-muted-foreground">
          <span>
            Showing {rows.length === 0 ? 0 : (current - 1) * PAGE_SIZE + 1}–{(current - 1) * PAGE_SIZE + rows.length} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon-sm" disabled={current === 1} onClick={() => setPage(current - 1)} aria-label="Previous page">
              <ChevronLeft />
            </Button>
            <span className="px-2 tabular-nums">
              {current} / {pages}
            </span>
            <Button variant="outline" size="icon-sm" disabled={current === pages} onClick={() => setPage(current + 1)} aria-label="Next page">
              <ChevronRight />
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}
