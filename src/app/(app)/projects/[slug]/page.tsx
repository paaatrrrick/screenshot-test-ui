"use client";

import * as React from "react";
import Link from "next/link";
import { notFound, useParams, useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  GitBranch,
  GitCommitHorizontal,
  Globe,
  Lock,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Rocket,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CopyButton, EmptyState, Mono, PageHeader, StatCard, StatusBadge } from "@/components/shared";
import { deployments, domains, NOW, type EnvVar, type Environment } from "@/lib/data";
import { nextId, useStore } from "@/lib/store";
import { compactNumber, formatDate, formatDuration, maskSecret, relativeTime } from "@/lib/format";

const tabs = ["overview", "deployments", "environment", "domains", "settings"] as const;

function ProjectInner() {
  const { slug } = useParams<{ slug: string }>();
  const params = useSearchParams();
  const router = useRouter();
  const { state, dispatch } = useStore();
  const project = state.projects.find((p) => p.slug === slug);
  const initialTab = (params.get("tab") as (typeof tabs)[number]) ?? "overview";
  const [tab, setTab] = React.useState<(typeof tabs)[number]>(tabs.includes(initialTab) ? initialTab : "overview");

  if (!project) notFound();

  const projectDeployments = deployments.filter((d) => d.projectSlug === project.slug);
  const projectDomains = domains.filter((d) => d.projectSlug === project.slug);
  const projectEnv = state.envVars.filter((e) => e.projectSlug === project.slug);
  const latest = projectDeployments[0];

  return (
    <>
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            {project.name}
            <StatusBadge status={project.status} />
          </span>
        }
        description={
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="inline-flex items-center gap-1">
              <GitBranch className="size-3.5" /> {project.repo}
            </span>
            <span className="inline-flex items-center gap-1">
              <Globe className="size-3.5" /> {project.region}
            </span>
            <span>{project.framework}</span>
          </span>
        }
        actions={
          <>
            <Button variant="outline" render={<a href={project.productionUrl} target="_blank" rel="noreferrer" />}>
              <ExternalLink data-icon="inline-start" /> Visit
            </Button>
            <Button onClick={() => toast.success("Deployment queued", { description: `${project.name} · main` })}>
              <Rocket data-icon="inline-start" /> Deploy
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" size="icon" aria-label="More" />}>
                <MoreHorizontal />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toast("Cache purged")}>Purge cache</DropdownMenuItem>
                <DropdownMenuItem onClick={() => dispatch({ type: "project.pause", slug: project.slug })}>
                  {project.status === "paused" ? "Resume project" : "Pause project"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => setTab("settings")}>
                  <Trash2 /> Delete project…
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      {project.status === "down" && (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>Production is down</AlertTitle>
          <AlertDescription>
            Monitors in 2 regions are failing. See incident{" "}
            <Link href="/incidents?focus=inc_204" className="underline">
              inc_204
            </Link>{" "}
            for status updates.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList variant="line" data-testid="project-tabs">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="environment">Environment</TabsTrigger>
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 pt-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Requests (24h)" value={compactNumber(project.requests24h)} />
            <StatCard label="Error rate" value={`${project.errorRate.toFixed(2)}%`} deltaTone={project.errorRate > 1 ? "down" : "up"} />
            <StatCard label="p95 latency" value={`${project.p95Ms} ms`} />
            <StatCard label="Uptime (30d)" value={project.status === "down" ? "97.1%" : "99.98%"} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Production deployment</CardTitle>
                <CardDescription>Currently serving {project.productionUrl}</CardDescription>
              </CardHeader>
              <CardContent>
                {latest ? (
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={latest.status} />
                      <Link href={`/deployments/${latest.id}`} className="font-mono text-xs hover:underline">
                        {latest.id}
                      </Link>
                      <span className="ml-auto text-xs text-muted-foreground">{relativeTime(latest.createdAt)}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <GitCommitHorizontal className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{latest.message}</p>
                        <p className="text-xs text-muted-foreground">
                          <Mono>{latest.commit}</Mono> on {latest.branch} by {latest.author}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No deployments yet. Push to your repository to trigger the first build.</p>
                )}
              </CardContent>
              {latest && (
                <CardFooter className="gap-2 border-t">
                  <Button variant="outline" size="sm" render={<Link href={`/deployments/${latest.id}`} />}>
                    View build
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast("Rollback started", { description: "Promoting previous deployment." })}>
                    <RefreshCw data-icon="inline-start" /> Rollback
                  </Button>
                </CardFooter>
              )}
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-[140px_1fr] gap-y-2 text-sm">
                  <dt className="text-muted-foreground">Project ID</dt>
                  <dd className="flex items-center gap-1 font-mono text-xs">
                    prj_{project.slug.replace(/-/g, "").slice(0, 10)} <CopyButton value={`prj_${project.slug}`} />
                  </dd>
                  <dt className="text-muted-foreground">Created</dt>
                  <dd>{formatDate(project.createdAt)}</dd>
                  <dt className="text-muted-foreground">Production branch</dt>
                  <dd>main</dd>
                  <dt className="text-muted-foreground">Node version</dt>
                  <dd>22.x</dd>
                  <dt className="text-muted-foreground">Build command</dt>
                  <dd className="font-mono text-xs">pnpm build</dd>
                  <dt className="text-muted-foreground">Root directory</dt>
                  <dd className="font-mono text-xs">./</dd>
                </dl>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deployments" className="pt-4">
          {projectDeployments.length === 0 ? (
            <EmptyState
              icon={Rocket}
              title="No deployments yet"
              description="Connect a repository and push a commit, or trigger a deployment manually to see builds here."
              action={
                <Button onClick={() => toast.success("Deployment queued")}>
                  <Rocket data-icon="inline-start" /> Deploy now
                </Button>
              }
            />
          ) : (
            <Card className="py-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Deployment</TableHead>
                    <TableHead>Environment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectDeployments.map((d) => (
                    <TableRow key={d.id} className="cursor-pointer" onClick={() => router.push(`/deployments/${d.id}`)}>
                      <TableCell className="pl-4">
                        <div className="font-medium">{d.message}</div>
                        <div className="text-xs text-muted-foreground">
                          <span className="font-mono">{d.commit}</span> · {d.branch} · {d.author}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={d.environment} dot={false} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={d.status} />
                      </TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">{formatDuration(d.durationSec)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{relativeTime(d.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="environment" className="pt-4">
          <EnvironmentTab projectSlug={project.slug} vars={projectEnv} />
        </TabsContent>

        <TabsContent value="domains" className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Domains route traffic to the production deployment. SSL is provisioned automatically.</p>
            <Button variant="outline" onClick={() => toast("Domain added", { description: "Waiting for DNS verification." })}>
              <Plus data-icon="inline-start" /> Add domain
            </Button>
          </div>
          <Card className="py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Domain</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>SSL</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectDomains.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-2 font-medium">
                        {d.host}
                        {d.primary && <Badge variant="outline">Primary</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {d.verified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <Check className="size-3.5" /> Verified
                        </span>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger render={<span className="inline-flex cursor-help items-center gap-1 text-amber-600 dark:text-amber-400" />}>
                            <AlertTriangle className="size-3.5" /> Pending DNS
                          </TooltipTrigger>
                          <TooltipContent>
                            Add a CNAME record pointing <Mono>{d.host}</Mono> to <Mono>cname.orbit.dev</Mono>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={d.ssl} dot={false} />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => toast("Re-checking DNS…")}>
                        Refresh
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {projectDomains.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                      No custom domains. Your project is reachable at {project.slug}.orbit.app.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 pt-4">
          <SettingsTab project={project} />
        </TabsContent>
      </Tabs>
    </>
  );
}

function EnvironmentTab({ projectSlug, vars }: { projectSlug: string; vars: EnvVar[] }) {
  const { dispatch } = useStore();
  const [revealed, setRevealed] = React.useState<Set<string>>(new Set());
  const [envFilter, setEnvFilter] = React.useState<"all" | Environment>("all");
  const [addOpen, setAddOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<EnvVar | null>(null);

  const toggle = (id: string) =>
    setRevealed((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const visible = vars.filter((v) => envFilter === "all" || v.environments.includes(envFilter));

  return (
    <div className="space-y-4" data-testid="env-vars">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={envFilter} onValueChange={(v) => setEnvFilter(v as typeof envFilter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="production">Production</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="development">Development</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast("Exported .env file")}>
            Export .env
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus data-icon="inline-start" /> Add variable
          </Button>
        </div>
      </div>
      {visible.length === 0 ? (
        <EmptyState
          icon={Lock}
          title="No environment variables"
          description="Variables are encrypted at rest and injected into your builds and runtime."
          action={
            <Button onClick={() => setAddOpen(true)}>
              <Plus data-icon="inline-start" /> Add variable
            </Button>
          }
        />
      ) : (
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Key</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Environments</TableHead>
                <TableHead className="text-right">Updated</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((v) => {
                const shown = !v.secret || revealed.has(v.id);
                return (
                  <TableRow key={v.id} data-env-key={v.key}>
                    <TableCell className="pl-4 font-mono text-xs font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        {v.secret && <Lock className="size-3 text-muted-foreground" />}
                        {v.key}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[320px]">
                      <div className="flex items-center gap-1">
                        <span className={`truncate font-mono text-xs ${shown ? "" : "text-muted-foreground"}`}>
                          {shown ? v.value : maskSecret(v.value)}
                        </span>
                        {v.secret && (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            aria-label={shown ? "Hide value" : "Reveal value"}
                            onClick={() => toggle(v.id)}
                            data-testid={`reveal-${v.key}`}
                          >
                            {shown ? <EyeOff /> : <Eye />}
                          </Button>
                        )}
                        <CopyButton value={v.value} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {v.environments.map((e) => (
                          <StatusBadge key={e} status={e} dot={false} />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{relativeTime(v.updatedAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Variable actions" />}>
                          <MoreHorizontal />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditing(v)}>Edit</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                              dispatch({ type: "env.delete", id: v.id });
                              toast(`Removed ${v.key}`);
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
      <EnvVarDialog
        key={editing?.id ?? (addOpen ? "new" : "closed")}
        open={addOpen || editing !== null}
        onOpenChange={(o) => {
          if (!o) {
            setAddOpen(false);
            setEditing(null);
          }
        }}
        projectSlug={projectSlug}
        existing={editing}
      />
    </div>
  );
}

function EnvVarDialog({
  open,
  onOpenChange,
  projectSlug,
  existing,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  projectSlug: string;
  existing: EnvVar | null;
}) {
  const { dispatch } = useStore();
  const [key, setKey] = React.useState(existing?.key ?? "");
  const [value, setValue] = React.useState(existing?.value ?? "");
  const [secret, setSecret] = React.useState(existing?.secret ?? true);
  const [envs, setEnvs] = React.useState<Environment[]>(existing?.environments ?? ["production", "preview", "development"]);

  const toggleEnv = (e: Environment) => setEnvs((s) => (s.includes(e) ? s.filter((x) => x !== e) : [...s, e]));
  const valid = /^[A-Z_][A-Z0-9_]*$/.test(key) && value.length > 0 && envs.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="env-var-dialog">
        <DialogHeader>
          <DialogTitle>{existing ? "Edit variable" : "Add environment variable"}</DialogTitle>
          <DialogDescription>Changes apply to the next deployment in each selected environment.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="env-key">Key</Label>
            <Input
              id="env-key"
              placeholder="API_BASE_URL"
              className="font-mono"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              aria-invalid={key !== "" && !/^[A-Z_][A-Z0-9_]*$/.test(key)}
            />
            {key !== "" && !/^[A-Z_][A-Z0-9_]*$/.test(key) && (
              <p className="text-xs text-destructive">Keys may only contain uppercase letters, digits, and underscores.</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="env-value">Value</Label>
            <Textarea id="env-value" className="font-mono text-xs" rows={3} value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Environments</Label>
            <div className="flex flex-wrap gap-4">
              {(["production", "preview", "development"] as Environment[]).map((e) => (
                <Label key={e} className="flex items-center gap-2 font-normal capitalize">
                  <Checkbox checked={envs.includes(e)} onCheckedChange={() => toggleEnv(e)} /> {e}
                </Label>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Sensitive</p>
              <p className="text-xs text-muted-foreground">Value is hidden in the UI and never returned by the API.</p>
            </div>
            <Switch checked={secret} onCheckedChange={setSecret} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!valid}
            onClick={() => {
              dispatch({
                type: "env.upsert",
                envVar: {
                  id: existing?.id ?? nextId("env"),
                  projectSlug,
                  key,
                  value,
                  secret,
                  environments: envs,
                  updatedAt: NOW.toISOString(),
                },
              });
              toast.success(existing ? `Updated ${key}` : `Added ${key}`);
              onOpenChange(false);
            }}
          >
            {existing ? "Save changes" : "Add variable"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SettingsTab({ project }: { project: { slug: string; name: string; status: string } }) {
  const { dispatch } = useStore();
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [confirmText, setConfirmText] = React.useState("");

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Project name and build configuration.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pname">Project name</Label>
            <Input id="pname" defaultValue={project.name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pbranch">Production branch</Label>
            <Input id="pbranch" defaultValue="main" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pbuild">Build command</Label>
            <Input id="pbuild" defaultValue="pnpm build" className="font-mono text-xs" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="proot">Root directory</Label>
            <Input id="proot" defaultValue="./" className="font-mono text-xs" />
          </div>
        </CardContent>
        <CardFooter className="justify-end border-t">
          <Button onClick={() => toast.success("Settings saved")}>Save</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deployment protection</CardTitle>
          <CardDescription>Control who can access preview deployments.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            ["Password protect previews", "Require a shared password to view preview deployments.", false],
            ["Require Orbit login", "Only organization members can view previews.", true],
            ["Auto-cancel superseded builds", "Cancel queued builds when a newer commit arrives on the same branch.", true],
            ["Skew protection", "Keep old client assets available for 24h after a deploy.", true],
          ].map(([title, desc, on]) => (
            <div key={title as string} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">{title as string}</p>
                <p className="text-xs text-muted-foreground">{desc as string}</p>
              </div>
              <Switch defaultChecked={on as boolean} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>These actions are irreversible.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Transfer project</p>
              <p className="text-xs text-muted-foreground">Move this project to another organization.</p>
            </div>
            <Button variant="outline" onClick={() => toast("Transfer requests require an owner of the target organization.")}>
              Transfer
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-destructive/40 p-3">
            <div>
              <p className="text-sm font-medium">Delete project</p>
              <p className="text-xs text-muted-foreground">Deletes all deployments, domains, and environment variables.</p>
            </div>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)} data-testid="delete-project">
              <Trash2 data-icon="inline-start" /> Delete project
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent data-testid="delete-project-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {project.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the project, its {deployments.filter((d) => d.projectSlug === project.slug).length} deployments, and all associated domains. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="confirm-delete">
              Type <Mono>{project.slug}</Mono> to confirm
            </Label>
            <Input id="confirm-delete" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} autoComplete="off" />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmText("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={confirmText !== project.slug}
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                dispatch({ type: "project.delete", slug: project.slug });
                toast.success(`Deleted ${project.name}`);
                router.push("/projects");
              }}
            >
              Delete project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function ProjectPage() {
  return (
    <React.Suspense>
      <ProjectInner />
    </React.Suspense>
  );
}
