"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Flag, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EmptyState, Mono, PageHeader } from "@/components/shared";
import { NOW, type FeatureFlag, type FlagRule } from "@/lib/data";
import { nextId, useStore } from "@/lib/store";
import { relativeTime } from "@/lib/format";

const envs = ["production", "staging", "development"] as const;

function FlagsInner() {
  const params = useSearchParams();
  const { state, dispatch } = useStore();
  const [query, setQuery] = React.useState("");
  const [createOpen, setCreateOpen] = React.useState(params.get("new") === "1");
  const [focus, setFocus] = React.useState<string | null>(params.get("focus"));

  const filtered = state.flags.filter(
    (f) => query === "" || f.name.toLowerCase().includes(query.toLowerCase()) || f.key.includes(query.toLowerCase()) || f.tags.some((t) => t.includes(query.toLowerCase())),
  );
  const focused = state.flags.find((f) => f.key === focus) ?? null;

  return (
    <>
      <PageHeader
        title="Feature flags"
        description="Toggle features per environment and target specific users with rules."
        actions={
          <Button onClick={() => setCreateOpen(true)} data-testid="create-flag">
            <Plus data-icon="inline-start" /> Create flag
          </Button>
        }
      />
      <div className="relative sm:max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by name, key, or tag…" className="pl-8" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Flag} title="No flags found" description="Create a flag to start controlling rollouts without redeploying." />
      ) : (
        <Card className="py-0">
          <Table data-testid="flags-table">
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Flag</TableHead>
                <TableHead>Enabled</TableHead>
                <TableHead>Production</TableHead>
                <TableHead>Staging</TableHead>
                <TableHead>Development</TableHead>
                <TableHead>Rollout</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Updated</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((f) => (
                <TableRow key={f.id} data-flag-key={f.key}>
                  <TableCell className="pl-4">
                    <button type="button" className="text-left" onClick={() => setFocus(f.key)}>
                      <div className="font-medium hover:underline">{f.name}</div>
                      <div className="flex items-center gap-1.5">
                        <Mono>{f.key}</Mono>
                        {f.tags.map((t) => (
                          <Badge key={t} variant="outline" className="h-4 px-1.5 text-[10px]">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </button>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={f.enabled}
                      onCheckedChange={() => {
                        dispatch({ type: "flag.toggle", id: f.id });
                        toast(`${f.name} ${f.enabled ? "disabled" : "enabled"}`);
                      }}
                      aria-label={`Toggle ${f.name}`}
                    />
                  </TableCell>
                  {envs.map((e) => (
                    <TableCell key={e}>
                      <Switch
                        size="sm"
                        checked={f.environments[e]}
                        disabled={!f.enabled}
                        onCheckedChange={(v) => dispatch({ type: "flag.env", id: f.id, env: e, value: v })}
                        aria-label={`${f.name} in ${e}`}
                      />
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-primary" style={{ width: `${f.rollout}%` }} />
                      </div>
                      <span className="text-xs tabular-nums text-muted-foreground">{f.rollout}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{f.owner}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{relativeTime(f.updatedAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Flag actions" />}>
                        <MoreHorizontal />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setFocus(f.key)}>View details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast("Copied SDK snippet")}>Copy SDK snippet</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => {
                            dispatch({ type: "flag.delete", id: f.id });
                            toast(`Deleted ${f.key}`);
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

      <CreateFlagDialog open={createOpen} onOpenChange={setCreateOpen} />

      <Sheet open={focused !== null} onOpenChange={(o) => !o && setFocus(null)}>
        <SheetContent className="w-full sm:max-w-lg" data-testid="flag-detail-sheet">
          {focused && (
            <>
              <SheetHeader>
                <SheetTitle>{focused.name}</SheetTitle>
                <SheetDescription>
                  <Mono>{focused.key}</Mono> · owned by {focused.owner}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 px-4 pb-4 text-sm">
                <p className="text-muted-foreground">{focused.description}</p>
                <div className="space-y-2">
                  <h4 className="font-medium">Environments</h4>
                  {envs.map((e) => (
                    <div key={e} className="flex items-center justify-between rounded-lg border px-3 py-2">
                      <span className="capitalize">{e}</span>
                      <Switch
                        checked={focused.environments[e]}
                        disabled={!focused.enabled}
                        onCheckedChange={(v) => dispatch({ type: "flag.env", id: focused.id, env: e, value: v })}
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Targeting rules</h4>
                  {focused.rules.length === 0 && <p className="text-muted-foreground">No rules. Flag is served to {focused.rollout}% of all users.</p>}
                  {focused.rules.map((r, i) => (
                    <div key={r.id} className="rounded-lg border px-3 py-2 font-mono text-xs">
                      <span className="text-muted-foreground">{i === 0 ? "IF" : "ELSE IF"}</span> {r.attribute}{" "}
                      <span className="text-muted-foreground">{r.operator.replace("_", " ")}</span> &quot;{r.value}&quot;{" "}
                      <span className="text-muted-foreground">→ serve</span> {String(r.serve)}
                    </div>
                  ))}
                  <div className="rounded-lg border border-dashed px-3 py-2 font-mono text-xs text-muted-foreground">
                    ELSE → serve true to {focused.rollout}% of users
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">SDK usage</h4>
                  <pre className="overflow-auto rounded-lg bg-zinc-950 p-3 text-[11px] text-zinc-100">{`const enabled = await orbit.flags.isEnabled("${focused.key}", {\n  user: { id: user.id, plan: user.plan },\n});`}</pre>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function CreateFlagDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { dispatch } = useStore();
  const [tab, setTab] = React.useState("basics");
  const [name, setName] = React.useState("");
  const [key, setKey] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [rollout, setRollout] = React.useState(10);
  const [rules, setRules] = React.useState<FlagRule[]>([{ id: "new-1", attribute: "plan", operator: "is", value: "", serve: true }]);
  const [envState, setEnvState] = React.useState({ production: false, staging: true, development: true });

  const reset = () => {
    setTab("basics");
    setName("");
    setKey("");
    setDescription("");
    setRollout(10);
    setRules([{ id: "new-1", attribute: "plan", operator: "is", value: "", serve: true }]);
  };

  const updateRule = (id: string, patch: Partial<FlagRule>) => setRules((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="sm:max-w-2xl" data-testid="create-flag-dialog">
        <DialogHeader>
          <DialogTitle>Create feature flag</DialogTitle>
          <DialogDescription>Flags are evaluated at the edge in under 1ms. Changes propagate globally within seconds.</DialogDescription>
        </DialogHeader>
        <Tabs value={tab} onValueChange={(v) => setTab(v as string)}>
          <TabsList className="w-full">
            <TabsTrigger value="basics">1. Basics</TabsTrigger>
            <TabsTrigger value="targeting">2. Targeting</TabsTrigger>
            <TabsTrigger value="rollout">3. Rollout</TabsTrigger>
          </TabsList>
          <TabsContent value="basics" className="space-y-4 pt-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="flag-name">Name</Label>
                <Input
                  id="flag-name"
                  placeholder="New onboarding flow"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setKey(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flag-key">Key</Label>
                <Input id="flag-key" placeholder="new-onboarding-flow" className="font-mono" value={key} onChange={(e) => setKey(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="flag-desc">Description</Label>
              <Textarea id="flag-desc" rows={3} placeholder="What does this flag control?" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Flag type</Label>
              <Select defaultValue="boolean">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="string">String variant</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          <TabsContent value="targeting" className="space-y-3 pt-2" data-testid="flag-targeting">
            <p className="text-xs text-muted-foreground">Rules are evaluated top to bottom. The first matching rule decides the value.</p>
            {rules.map((r, i) => (
              <div key={r.id} className="grid grid-cols-[52px_1fr_1fr_1.4fr_auto] items-center gap-2 rounded-lg border p-2">
                <span className="text-xs font-medium text-muted-foreground">{i === 0 ? "IF" : "ELSE IF"}</span>
                <Select value={r.attribute} onValueChange={(v) => updateRule(r.id, { attribute: v as string })}>
                  <SelectTrigger className="w-full" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["plan", "email", "country", "platform", "userId", "orgId"].map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={r.operator} onValueChange={(v) => updateRule(r.id, { operator: v as FlagRule["operator"] })}>
                  <SelectTrigger className="w-full" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="is">is</SelectItem>
                    <SelectItem value="is_not">is not</SelectItem>
                    <SelectItem value="contains">contains</SelectItem>
                    <SelectItem value="starts_with">starts with</SelectItem>
                    <SelectItem value="in">is one of</SelectItem>
                  </SelectContent>
                </Select>
                <Input className="h-7 font-mono text-xs" placeholder="value" value={r.value} onChange={(e) => updateRule(r.id, { value: e.target.value })} />
                <Button variant="ghost" size="icon-sm" aria-label="Remove rule" onClick={() => setRules((rs) => rs.filter((x) => x.id !== r.id))}>
                  <Trash2 />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRules((rs) => [...rs, { id: `new-${rs.length + 1}`, attribute: "email", operator: "contains", value: "", serve: true }])}
            >
              <Plus data-icon="inline-start" /> Add rule
            </Button>
          </TabsContent>
          <TabsContent value="rollout" className="space-y-5 pt-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Percentage rollout</Label>
                <span className="text-sm font-medium tabular-nums">{rollout}%</span>
              </div>
              <Slider value={[rollout]} onValueChange={(v) => setRollout(Array.isArray(v) ? v[0] : v)} max={100} step={5} />
              <p className="text-xs text-muted-foreground">Users are bucketed deterministically by ID, so the same user always sees the same value.</p>
            </div>
            <div className="space-y-2">
              <Label>Enable in</Label>
              {envs.map((e) => (
                <div key={e} className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <span className="text-sm capitalize">{e}</span>
                  <Switch checked={envState[e]} onCheckedChange={(v) => setEnvState((s) => ({ ...s, [e]: v }))} />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {tab !== "rollout" ? (
            <Button onClick={() => setTab(tab === "basics" ? "targeting" : "rollout")} disabled={tab === "basics" && key === ""}>
              Next
            </Button>
          ) : (
            <Button
              disabled={key === ""}
              onClick={() => {
                const flag: FeatureFlag = {
                  id: nextId("flg"),
                  key,
                  name: name || key,
                  description,
                  enabled: true,
                  environments: envState,
                  rollout,
                  rules: rules.filter((r) => r.value !== ""),
                  tags: ["new"],
                  owner: "Sam Okafor",
                  updatedAt: NOW.toISOString(),
                };
                dispatch({ type: "flag.create", flag });
                toast.success(`Created ${key}`);
                onOpenChange(false);
              }}
            >
              Create flag
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function FlagsPage() {
  return (
    <React.Suspense>
      <FlagsInner />
    </React.Suspense>
  );
}
