"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, MessageSquare, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, PageHeader, StatusBadge } from "@/components/shared";
import { useStore } from "@/lib/store";
import { formatDateTime, initials, relativeTime } from "@/lib/format";

function IncidentsInner() {
  const params = useSearchParams();
  const { state, dispatch } = useStore();
  const [filter, setFilter] = React.useState<"active" | "resolved" | "all">("active");
  const [selected, setSelected] = React.useState<string | null>(params.get("focus") ?? state.incidents[0]?.id ?? null);
  const [note, setNote] = React.useState("");

  const list = state.incidents.filter((i) => (filter === "all" ? true : filter === "active" ? i.status !== "resolved" : i.status === "resolved"));
  const incident = state.incidents.find((i) => i.id === selected) ?? list[0] ?? null;

  return (
    <>
      <PageHeader title="Incidents" description="Track, acknowledge, and resolve service disruptions." />
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="space-y-3">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList className="w-full">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="space-y-2" data-testid="incident-list">
            {list.length === 0 && <EmptyState icon={CheckCircle2} title="All clear" description="No incidents match this filter." />}
            {list.map((i) => (
              <button
                key={i.id}
                type="button"
                onClick={() => setSelected(i.id)}
                className={cn(
                  "w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted/50",
                  incident?.id === i.id && "border-primary bg-muted/40",
                )}
              >
                <div className="flex items-center gap-2">
                  <StatusBadge status={i.severity} dot={false} />
                  <span className="font-mono text-xs text-muted-foreground">{i.id}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{relativeTime(i.startedAt)}</span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-sm font-medium">{i.title}</p>
                <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <StatusBadge status={i.status} dot={false} className="h-4 px-1.5 text-[10px]" />
                  {i.service}
                </div>
              </button>
            ))}
          </div>
        </div>

        {incident ? (
          <Card data-testid="incident-detail">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={incident.severity} dot={false} />
                <StatusBadge status={incident.status} dot={false} />
                <span className="font-mono text-xs text-muted-foreground">{incident.id}</span>
              </div>
              <CardTitle className="text-lg">{incident.title}</CardTitle>
              <CardDescription>
                {incident.service} · started {formatDateTime(incident.startedAt)} UTC
                {incident.resolvedAt && ` · resolved ${relativeTime(incident.resolvedAt)}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Assignee</span>
                  <Select defaultValue={incident.assignee ?? "unassigned"}>
                    <SelectTrigger size="sm" className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {state.members
                        .filter((m) => m.status === "active")
                        .map((m) => (
                          <SelectItem key={m.id} value={m.name}>
                            {m.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="ml-auto flex gap-2">
                  {incident.status === "open" && (
                    <Button variant="outline" size="sm" onClick={() => dispatch({ type: "incident.status", id: incident.id, status: "acknowledged" })}>
                      Acknowledge
                    </Button>
                  )}
                  {incident.status !== "resolved" && (
                    <Button
                      size="sm"
                      onClick={() => {
                        dispatch({ type: "incident.status", id: incident.id, status: "resolved" });
                        toast.success("Incident resolved", { description: "Subscribers have been notified." });
                      }}
                    >
                      <CheckCircle2 data-icon="inline-start" /> Resolve
                    </Button>
                  )}
                  {incident.status === "resolved" && (
                    <Button variant="outline" size="sm" onClick={() => dispatch({ type: "incident.status", id: incident.id, status: "open" })}>
                      Reopen
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Timeline</h4>
                <ol className="relative space-y-4 border-l pl-6">
                  {incident.updates.map((u, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-[31px] top-1 flex size-5 items-center justify-center rounded-full border bg-background">
                        <Avatar className="size-4">
                          <AvatarFallback className="text-[8px]">{initials(u.author)}</AvatarFallback>
                        </Avatar>
                      </span>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{u.author}</span> · {formatDateTime(u.ts)}
                      </p>
                      <p className="mt-1 text-sm">{u.text}</p>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="space-y-2">
                <Textarea placeholder="Post an update…" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    disabled={note.trim() === ""}
                    onClick={() => {
                      toast.success("Update posted");
                      setNote("");
                    }}
                  >
                    <MessageSquare data-icon="inline-start" /> Post update
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <EmptyState icon={ShieldAlert} title="Select an incident" description="Choose an incident from the list to view its timeline." />
        )}
      </div>
    </>
  );
}

export default function IncidentsPage() {
  return (
    <React.Suspense>
      <IncidentsInner />
    </React.Suspense>
  );
}
