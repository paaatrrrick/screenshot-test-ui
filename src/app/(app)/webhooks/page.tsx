"use client";

import * as React from "react";
import { ChevronDown, ChevronRight, Plus, Send, Trash2, Webhook as WebhookIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyButton, EmptyState, Mono, PageHeader } from "@/components/shared";
import { NOW } from "@/lib/data";
import { nextId, useStore } from "@/lib/store";
import { formatDateTime, relativeTime } from "@/lib/format";

const eventGroups = [
  { label: "Deployments", events: ["deployment.created", "deployment.ready", "deployment.error", "deployment.canceled"] },
  { label: "Monitors & incidents", events: ["monitor.down", "monitor.recovered", "incident.opened", "incident.resolved"] },
  { label: "Feature flags", events: ["flag.created", "flag.updated", "flag.deleted"] },
  { label: "Organization", events: ["member.added", "member.removed", "api_key.created"] },
];

export default function WebhooksPage() {
  const { state, dispatch } = useStore();
  const [open, setOpen] = React.useState(false);
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [url, setUrl] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [events, setEvents] = React.useState<string[]>(["deployment.ready", "deployment.error"]);
  const [signing, setSigning] = React.useState(true);

  return (
    <>
      <PageHeader
        title="Webhooks"
        description="Receive HTTP callbacks when things happen in Orbit."
        actions={
          <Button onClick={() => setOpen(true)} data-testid="create-webhook">
            <Plus data-icon="inline-start" /> Add endpoint
          </Button>
        }
      />

      {state.webhooks.length === 0 ? (
        <EmptyState icon={WebhookIcon} title="No endpoints" description="Add an endpoint to receive events." />
      ) : (
        <div className="space-y-3" data-testid="webhook-list">
          {state.webhooks.map((w) => {
            const failing = w.deliveries.filter((d) => d.status >= 400).length;
            const isOpen = expanded === w.id;
            return (
              <Card key={w.id} className="py-0">
                <div className="flex items-center gap-3 p-3">
                  <Button variant="ghost" size="icon-sm" aria-label="Toggle deliveries" onClick={() => setExpanded(isOpen ? null : w.id)}>
                    {isOpen ? <ChevronDown /> : <ChevronRight />}
                  </Button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-mono text-sm">{w.url}</span>
                      {!w.active && <Badge variant="secondary">Disabled</Badge>}
                      {failing > 0 && <Badge variant="destructive">{failing} failed</Badge>}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                      <span>{w.description}</span>
                      <span>·</span>
                      {w.events.slice(0, 3).map((e) => (
                        <Mono key={e}>{e}</Mono>
                      ))}
                      {w.events.length > 3 && <span>+{w.events.length - 3} more</span>}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => toast.success("Test event sent", { description: "ping → 200 OK in 96ms" })}>
                    <Send data-icon="inline-start" /> Send test
                  </Button>
                  <Switch checked={w.active} onCheckedChange={() => dispatch({ type: "webhook.toggle", id: w.id })} aria-label="Enable endpoint" />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete endpoint"
                    onClick={() => {
                      dispatch({ type: "webhook.delete", id: w.id });
                      toast("Endpoint removed");
                    }}
                  >
                    <Trash2 />
                  </Button>
                </div>
                {isOpen && (
                  <CardContent className="border-t pt-3">
                    <Tabs defaultValue="deliveries">
                      <TabsList>
                        <TabsTrigger value="deliveries">Recent deliveries</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                      </TabsList>
                      <TabsContent value="deliveries" className="pt-2">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Event</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Duration</TableHead>
                              <TableHead className="text-right">Time</TableHead>
                              <TableHead className="w-20" />
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {w.deliveries.map((d) => (
                              <TableRow key={d.id}>
                                <TableCell className="font-mono text-xs">{d.event}</TableCell>
                                <TableCell>
                                  <span className={cn("font-mono text-xs font-medium", d.status < 400 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                                    {d.status}
                                  </span>
                                </TableCell>
                                <TableCell className="tabular-nums text-muted-foreground">{d.durationMs >= 30_000 ? "timeout" : `${d.durationMs} ms`}</TableCell>
                                <TableCell className="text-right text-muted-foreground">{formatDateTime(d.ts)}</TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="xs" onClick={() => toast("Redelivery queued")}>
                                    Redeliver
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TabsContent>
                      <TabsContent value="settings" className="space-y-3 pt-2 text-sm">
                        <div className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p className="font-medium">Signing secret</p>
                            <p className="text-xs text-muted-foreground">Verify the <Mono>Orbit-Signature</Mono> header with this secret.</p>
                          </div>
                          <div className="flex items-center gap-1 font-mono text-xs">
                            {w.secretPrefix}•••••••• <CopyButton value={`${w.secretPrefix}_redacted`} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p className="font-medium">Retry policy</p>
                            <p className="text-xs text-muted-foreground">Exponential backoff, 5 attempts over 6 hours. Disabled automatically after 3 consecutive failures.</p>
                          </div>
                          <span className="text-xs text-muted-foreground">Created {relativeTime(w.createdAt)}</span>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="flex w-full flex-col sm:max-w-lg" data-testid="create-webhook-sheet">
          <SheetHeader>
            <SheetTitle>Add webhook endpoint</SheetTitle>
            <SheetDescription>We&apos;ll POST a JSON payload to this URL for each selected event.</SheetDescription>
          </SheetHeader>
          <div className="flex-1 space-y-5 overflow-auto px-4">
            <div className="space-y-2">
              <Label htmlFor="wh-url">Endpoint URL</Label>
              <Input id="wh-url" placeholder="https://example.com/webhooks/orbit" className="font-mono text-xs" value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wh-desc">Description</Label>
              <Input id="wh-desc" placeholder="Slack #deploys" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Events</Label>
                <span className="text-xs text-muted-foreground">{events.length} selected</span>
              </div>
              <div className="space-y-3 rounded-lg border p-3">
                {eventGroups.map((g) => (
                  <div key={g.label} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground">{g.label}</p>
                      <Button
                        variant="link"
                        size="xs"
                        className="h-auto p-0 text-xs"
                        onClick={() =>
                          setEvents((ev) => (g.events.every((e) => ev.includes(e)) ? ev.filter((e) => !g.events.includes(e)) : Array.from(new Set([...ev, ...g.events]))))
                        }
                      >
                        {g.events.every((e) => events.includes(e)) ? "Deselect all" : "Select all"}
                      </Button>
                    </div>
                    {g.events.map((e) => (
                      <Label key={e} className="flex items-center gap-2 font-mono text-xs font-normal">
                        <Checkbox checked={events.includes(e)} onCheckedChange={(c) => setEvents((ev) => (c ? [...ev, e] : ev.filter((x) => x !== e)))} /> {e}
                      </Label>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Sign payloads</p>
                <p className="text-xs text-muted-foreground">Include an HMAC-SHA256 signature header.</p>
              </div>
              <Switch checked={signing} onCheckedChange={setSigning} />
            </div>
          </div>
          <SheetFooter className="flex-row justify-end gap-2 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!url.startsWith("http") || events.length === 0}
              onClick={() => {
                dispatch({
                  type: "webhook.create",
                  webhook: { id: nextId("wh"), url, description: description || "Untitled endpoint", events, active: true, secretPrefix: "whsec_new1", createdAt: NOW.toISOString(), deliveries: [] },
                });
                toast.success("Endpoint added", { description: "A ping event has been sent." });
                setOpen(false);
                setUrl("");
                setDescription("");
              }}
            >
              Add endpoint
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
