"use client";

import * as React from "react";
import { Download, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mono, PageHeader } from "@/components/shared";
import { auditEvents } from "@/lib/data";
import { formatDateTime, initials } from "@/lib/format";

const categories = ["all", "deployment", "member", "api_key", "flag", "env", "settings", "billing", "project", "monitor", "webhook", "incident", "domain"];

export default function AuditLogPage() {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [actor, setActor] = React.useState("all");

  const actors = Array.from(new Set(auditEvents.map((e) => e.actor)));
  const rows = auditEvents.filter(
    (e) =>
      (category === "all" || e.action.startsWith(category)) &&
      (actor === "all" || e.actor === actor) &&
      (query === "" || e.target.toLowerCase().includes(query.toLowerCase()) || e.details.toLowerCase().includes(query.toLowerCase()) || e.action.includes(query.toLowerCase())),
  );

  return (
    <>
      <PageHeader
        title="Audit log"
        description="Every change made by members and API keys, retained for 365 days."
        actions={
          <Button variant="outline" onClick={() => toast("Export started", { description: "You'll receive an email when the CSV is ready." })}>
            <Download data-icon="inline-start" /> Export CSV
          </Button>
        }
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search actions, targets, details…" className="pl-8" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={category} onValueChange={(v) => setCategory(v as string)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c === "all" ? "All categories" : c.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={actor} onValueChange={(v) => setActor(v as string)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actors</SelectItem>
            {actors.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Card className="py-0">
        <Table data-testid="audit-table">
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Time (UTC)</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="pr-4 text-right">IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="pl-4 font-mono text-xs text-muted-foreground">{formatDateTime(e.ts)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="size-6">
                      <AvatarFallback className="text-[10px]">{initials(e.actor)}</AvatarFallback>
                    </Avatar>
                    {e.actor}
                  </div>
                </TableCell>
                <TableCell>
                  <Mono>{e.action}</Mono>
                </TableCell>
                <TableCell className="font-medium">{e.target}</TableCell>
                <TableCell className="max-w-[320px] truncate text-muted-foreground">{e.details}</TableCell>
                <TableCell className="pr-4 text-right font-mono text-xs text-muted-foreground">{e.ip}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  No events match.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
