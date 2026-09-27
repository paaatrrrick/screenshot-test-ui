"use client";

import * as React from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { Check, Circle, Download, ExternalLink, GitBranch, Loader2, RefreshCw, RotateCcw, Search, X, XCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CopyButton, Mono, PageHeader, StatusBadge } from "@/components/shared";
import { deployments } from "@/lib/data";
import { formatDateTime, formatDuration, relativeTime } from "@/lib/format";

const steps = ["Queued", "Cloning", "Installing", "Building", "Uploading", "Ready"];

function stepState(status: string, index: number): "done" | "active" | "failed" | "pending" {
  const activeIndex = status === "ready" ? 6 : status === "building" ? 3 : status === "queued" ? 0 : status === "error" ? 3 : 1;
  if (status === "error" && index === activeIndex) return "failed";
  if (index < activeIndex) return "done";
  if (index === activeIndex) return "active";
  return "pending";
}

export default function DeploymentPage() {
  const { id } = useParams<{ id: string }>();
  const deployment = deployments.find((d) => d.id === id);
  const [logQuery, setLogQuery] = React.useState("");
  const [showTimestamps, setShowTimestamps] = React.useState(true);
  const [wrap, setWrap] = React.useState(false);

  if (!deployment) notFound();

  const logs = deployment.logs.filter((l) => logQuery === "" || l.text.toLowerCase().includes(logQuery.toLowerCase()));
  const errorLine = deployment.logs.find((l) => l.level === "error");

  return (
    <>
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <span className="font-mono">{deployment.id}</span>
            <StatusBadge status={deployment.status} />
            <StatusBadge status={deployment.environment} dot={false} />
          </span>
        }
        description={
          <span>
            {deployment.message} · <Mono>{deployment.commit}</Mono> on <GitBranch className="inline size-3" /> {deployment.branch} by {deployment.author}
          </span>
        }
        actions={
          <>
            <Button variant="outline" render={<a href={deployment.url} target="_blank" rel="noreferrer" />}>
              <ExternalLink data-icon="inline-start" /> Visit
            </Button>
            <Button variant="outline" onClick={() => toast("Redeploy queued", { description: `${deployment.commit} · ${deployment.branch}` })}>
              <RefreshCw data-icon="inline-start" /> Redeploy
            </Button>
            {deployment.status === "ready" && deployment.environment !== "production" && (
              <AlertDialog>
                <AlertDialogTrigger render={<Button />}>Promote to production</AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Promote {deployment.id} to production?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Production traffic for {deployment.projectSlug} will switch to this build immediately. Environment variables from production will be applied.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => toast.success("Promoted to production")}>Promote</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {deployment.status === "ready" && deployment.environment === "production" && (
              <Button variant="outline" onClick={() => toast("Rollback started")}>
                <RotateCcw data-icon="inline-start" /> Rollback
              </Button>
            )}
            {(deployment.status === "building" || deployment.status === "queued") && (
              <Button variant="destructive" onClick={() => toast("Build canceled")}>
                <X data-icon="inline-start" /> Cancel build
              </Button>
            )}
          </>
        }
      />

      {deployment.status === "error" && errorLine && (
        <Alert variant="destructive" data-testid="build-error-banner">
          <XCircle />
          <AlertTitle>Build failed after {formatDuration(deployment.durationSec)}</AlertTitle>
          <AlertDescription className="font-mono text-xs">{errorLine.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Pipeline</CardTitle>
            <CardDescription>
              {deployment.status === "ready"
                ? `Completed in ${formatDuration(deployment.durationSec)}`
                : deployment.status === "error"
                  ? "Failed during build"
                  : deployment.status === "queued"
                    ? "Waiting for an available builder"
                    : "In progress"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-wrap items-center gap-2" data-testid="pipeline-steps">
              {steps.map((s, i) => {
                const st = stepState(deployment.status, i);
                return (
                  <React.Fragment key={s}>
                    <li className="flex items-center gap-1.5 text-sm">
                      {st === "done" && <Check className="size-4 text-emerald-600 dark:text-emerald-400" />}
                      {st === "active" && <Loader2 className="size-4 animate-spin text-blue-600 dark:text-blue-400" />}
                      {st === "failed" && <XCircle className="size-4 text-red-600 dark:text-red-400" />}
                      {st === "pending" && <Circle className="size-4 text-muted-foreground/50" />}
                      <span className={cn(st === "pending" && "text-muted-foreground")}>{s}</span>
                    </li>
                    {i < steps.length - 1 && <span className="h-px w-6 bg-border" />}
                  </React.Fragment>
                );
              })}
            </ol>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Project</dt>
                <dd>
                  <Link href={`/projects/${deployment.projectSlug}`} className="hover:underline">
                    {deployment.projectSlug}
                  </Link>
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Region</dt>
                <dd className="font-mono text-xs">{deployment.region}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Created</dt>
                <dd>{relativeTime(deployment.createdAt)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Duration</dt>
                <dd className="tabular-nums">{formatDuration(deployment.durationSec)}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">URL</dt>
                <dd className="flex min-w-0 items-center">
                  <span className="truncate font-mono text-xs">{deployment.url.replace("https://", "")}</span>
                  <CopyButton value={deployment.url} />
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="build">
        <TabsList variant="line">
          <TabsTrigger value="build">Build logs</TabsTrigger>
          <TabsTrigger value="runtime">Runtime logs</TabsTrigger>
          <TabsTrigger value="outputs">Outputs</TabsTrigger>
          <TabsTrigger value="checks">Checks</TabsTrigger>
        </TabsList>
        <TabsContent value="build" className="pt-4">
          <Card className="py-0">
            <div className="flex flex-col gap-3 border-b p-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Filter logs…" className="h-8 pl-8" value={logQuery} onChange={(e) => setLogQuery(e.target.value)} />
              </div>
              <div className="flex items-center gap-4 text-xs sm:ml-auto">
                <Label className="flex items-center gap-2 font-normal">
                  <Switch size="sm" checked={showTimestamps} onCheckedChange={setShowTimestamps} /> Timestamps
                </Label>
                <Label className="flex items-center gap-2 font-normal">
                  <Switch size="sm" checked={wrap} onCheckedChange={setWrap} /> Wrap lines
                </Label>
                <Button variant="ghost" size="sm" onClick={() => toast("Downloading build-log.txt")}>
                  <Download data-icon="inline-start" /> Download
                </Button>
              </div>
            </div>
            <div
              className={cn("max-h-[480px] overflow-auto bg-zinc-950 p-3 font-mono text-xs leading-5 text-zinc-100", wrap ? "whitespace-pre-wrap" : "whitespace-pre")}
              data-testid="build-logs"
            >
              {logs.length === 0 && <p className="text-zinc-500">{deployment.status === "queued" ? "Waiting for build to start…" : "No matching lines."}</p>}
              {logs.map((l, i) => (
                <div key={i} className={cn("flex gap-3 hover:bg-zinc-900", l.level === "error" && "bg-red-950/40")}>
                  <span className="w-6 shrink-0 text-right text-zinc-600 select-none">{i + 1}</span>
                  {showTimestamps && <span className="shrink-0 text-zinc-500">{l.ts}</span>}
                  <span className={cn("shrink-0 uppercase", l.level === "error" ? "text-red-400" : l.level === "warn" ? "text-amber-400" : "text-zinc-500")}>
                    {l.level.padEnd(5)}
                  </span>
                  <span className={cn(l.level === "error" && "text-red-300", l.level === "warn" && "text-amber-200")}>{l.text}</span>
                </div>
              ))}
              {deployment.status === "building" && (
                <div className="flex gap-3 text-zinc-500">
                  <span className="w-6" />
                  <Loader2 className="size-3.5 animate-spin" /> Building…
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="runtime" className="pt-4">
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Runtime logs for this deployment are available in the{" "}
              <Link href={`/logs?deployment=${deployment.id}`} className="underline">
                Log explorer
              </Link>
              .
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="outputs" className="pt-4">
          <Card className="py-0">
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["/", "Static", "12.4 kB"],
                  ["/api/health", "Function (edge)", "1.1 kB"],
                  ["/api/v1/[...route]", "Function (node 22)", "482 kB"],
                  ["/_next/static/*", "Static", "38.2 MB"],
                ].map(([route, type, size]) => (
                  <tr key={route} className="border-b last:border-0">
                    <td className="px-4 py-2 font-mono text-xs">{route}</td>
                    <td className="px-4 py-2 text-muted-foreground">{type}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">{size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>
        <TabsContent value="checks" className="pt-4">
          <Card className="py-0">
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Lighthouse performance", deployment.status === "ready" ? "passed" : "skipped", "Score 94"],
                  ["Bundle size budget", deployment.status === "ready" ? "passed" : "skipped", "+2.1 kB vs main"],
                  ["Type check", deployment.status === "error" ? "failed" : "passed", deployment.status === "error" ? "1 error" : "0 errors"],
                  ["Unit tests", deployment.status === "ready" ? "passed" : "skipped", "412 passed"],
                ].map(([name, st, detail]) => (
                  <tr key={name} className="border-b last:border-0">
                    <td className="px-4 py-2 font-medium">{name}</td>
                    <td className="px-4 py-2">
                      <span
                        className={cn(
                          "text-xs font-medium capitalize",
                          st === "passed" && "text-emerald-600 dark:text-emerald-400",
                          st === "failed" && "text-red-600 dark:text-red-400",
                          st === "skipped" && "text-muted-foreground",
                        )}
                      >
                        {st}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-muted-foreground">{detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>
      </Tabs>

      <p className="text-xs text-muted-foreground">Started {formatDateTime(deployment.createdAt)} UTC</p>
    </>
  );
}
