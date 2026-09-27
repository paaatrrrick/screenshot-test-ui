"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ExternalLink, FolderKanban, GitBranch, MoreHorizontal, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, PageHeader, StatusBadge } from "@/components/shared";
import { useStore } from "@/lib/store";
import { compactNumber, relativeTime } from "@/lib/format";

const statusFilters = ["all", "healthy", "degraded", "down", "paused"] as const;

function ProjectsInner() {
  const { state, dispatch } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<(typeof statusFilters)[number]>("all");
  const [view, setView] = React.useState<"table" | "grid">("table");
  const [newOpen, setNewOpen] = React.useState(params.get("new") === "1");

  const filtered = state.projects.filter(
    (p) =>
      (status === "all" || p.status === status) &&
      (query === "" || p.name.toLowerCase().includes(query.toLowerCase()) || p.slug.includes(query.toLowerCase())),
  );

  return (
    <>
      <PageHeader
        title="Projects"
        description={`${state.projects.length} projects across 4 regions`}
        actions={
          <Button onClick={() => setNewOpen(true)}>
            <Plus data-icon="inline-start" /> New project
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects…"
            className="pl-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            data-testid="projects-search"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusFilters.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "all" ? "All statuses" : s[0].toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Tabs value={view} onValueChange={(v) => setView(v as typeof view)} className="sm:ml-auto">
          <TabsList>
            <TabsTrigger value="table">Table</TabsTrigger>
            <TabsTrigger value="grid">Grid</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects match"
          description="Try a different search or clear the status filter."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setStatus("all");
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : view === "table" ? (
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Framework</TableHead>
                <TableHead>Region</TableHead>
                <TableHead className="text-right">Requests (24h)</TableHead>
                <TableHead className="text-right">Error rate</TableHead>
                <TableHead className="text-right">Last deploy</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.slug} className="cursor-pointer" onClick={() => router.push(`/projects/${p.slug}`)}>
                  <TableCell className="pl-4">
                    <div className="font-medium">{p.name}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <GitBranch className="size-3" /> {p.repo}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.framework}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{p.region}</TableCell>
                  <TableCell className="text-right tabular-nums">{compactNumber(p.requests24h)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    <span className={p.errorRate > 1 ? "font-medium text-red-600 dark:text-red-400" : ""}>{p.errorRate.toFixed(2)}%</span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {p.lastDeployedAt ? relativeTime(p.lastDeployedAt) : "Never"}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Project actions" />}>
                        <MoreHorizontal />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem render={<Link href={`/projects/${p.slug}`} />}>Open</DropdownMenuItem>
                        <DropdownMenuItem render={<a href={p.productionUrl} target="_blank" rel="noreferrer" />}>
                          <ExternalLink /> Visit site
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.success(`Deployment triggered for ${p.name}`)}>
                          Redeploy
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            dispatch({ type: "project.pause", slug: p.slug });
                            toast(p.status === "paused" ? `${p.name} resumed` : `${p.name} paused`);
                          }}
                        >
                          {p.status === "paused" ? "Resume" : "Pause"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <Link key={p.slug} href={`/projects/${p.slug}`}>
              <Card className="h-full transition-colors hover:bg-muted/40">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {p.name}
                    <StatusBadge status={p.status} />
                  </CardTitle>
                  <CardDescription>{p.repo}</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Requests</p>
                    <p className="font-medium tabular-nums">{compactNumber(p.requests24h)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Errors</p>
                    <p className="font-medium tabular-nums">{p.errorRate.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">p95</p>
                    <p className="font-medium tabular-nums">{p.p95Ms} ms</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <NewProjectDialog open={newOpen} onOpenChange={setNewOpen} />
    </>
  );
}

function NewProjectDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [step, setStep] = React.useState(1);
  const [name, setName] = React.useState("");
  const [repo, setRepo] = React.useState("");
  const [framework, setFramework] = React.useState("nextjs");
  const [region, setRegion] = React.useState("us-east-1");

  const reset = () => {
    setStep(1);
    setName("");
    setRepo("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="sm:max-w-lg" data-testid="new-project-dialog">
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>Step {step} of 3 — {step === 1 ? "Import repository" : step === 2 ? "Configure build" : "Review"}</DialogDescription>
        </DialogHeader>
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="repo">Git repository</Label>
              <Input id="repo" placeholder="orbit-labs/my-service" value={repo} onChange={(e) => setRepo(e.target.value)} />
              <p className="text-xs text-muted-foreground">We&apos;ll import from GitHub. Private repositories require the Orbit GitHub app.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Project name</Label>
              <Input id="name" placeholder="my-service" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Framework preset</Label>
              <Select value={framework} onValueChange={(v) => setFramework(v as string)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nextjs">Next.js</SelectItem>
                  <SelectItem value="astro">Astro</SelectItem>
                  <SelectItem value="node">Node.js</SelectItem>
                  <SelectItem value="go">Go</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="rust">Rust</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Region</Label>
              <RadioGroup value={region} onValueChange={(v) => setRegion(v as string)} className="grid-cols-2">
                {["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1"].map((r) => (
                  <Label key={r} className="flex items-center gap-2 rounded-lg border p-3 font-normal has-data-checked:border-primary">
                    <RadioGroupItem value={r} />
                    <span className="font-mono text-xs">{r}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="build">Build command</Label>
                <Input id="build" defaultValue="pnpm build" className="font-mono text-xs" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="out">Output directory</Label>
                <Input id="out" defaultValue=".next" className="font-mono text-xs" />
              </div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="rounded-lg border bg-muted/40 p-3 text-sm">
            <dl className="grid grid-cols-[120px_1fr] gap-y-1.5">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">{name || "my-service"}</dd>
              <dt className="text-muted-foreground">Repository</dt>
              <dd className="font-mono text-xs">{repo || "orbit-labs/my-service"}</dd>
              <dt className="text-muted-foreground">Framework</dt>
              <dd>{framework}</dd>
              <dt className="text-muted-foreground">Region</dt>
              <dd className="font-mono text-xs">{region}</dd>
            </dl>
          </div>
        )}
        <DialogFooter>
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)}>Continue</Button>
          ) : (
            <Button
              onClick={() => {
                toast.success(`Project "${name || "my-service"}" created`, { description: "First deployment queued." });
                onOpenChange(false);
                reset();
              }}
            >
              Create project
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense>
      <ProjectsInner />
    </Suspense>
  );
}
