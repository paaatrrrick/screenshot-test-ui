"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, KeyRound, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { CopyButton, EmptyState, PageHeader } from "@/components/shared";
import { NOW } from "@/lib/data";
import { nextId, useStore } from "@/lib/store";
import { formatDate, relativeTime } from "@/lib/format";

const scopeGroups = [
  { label: "Projects", scopes: ["projects:read", "projects:write"] },
  { label: "Deployments", scopes: ["deployments:read", "deployments:write"] },
  { label: "Environment", scopes: ["env:read", "env:write"] },
  { label: "Observability", scopes: ["logs:read", "metrics:read", "monitors:write"] },
  { label: "Organization", scopes: ["members:read", "members:write", "billing:read"] },
];

function ApiKeysInner() {
  const params = useSearchParams();
  const { state, dispatch } = useStore();
  const [open, setOpen] = React.useState(params.get("new") === "1");
  const [name, setName] = React.useState("");
  const [expiry, setExpiry] = React.useState("90");
  const [scopes, setScopes] = React.useState<string[]>(["projects:read", "deployments:read"]);
  const [created, setCreated] = React.useState<string | null>(null);

  const reset = () => {
    setName("");
    setExpiry("90");
    setScopes(["projects:read", "deployments:read"]);
  };

  return (
    <>
      <PageHeader
        title="API keys"
        description="Keys authenticate the Orbit CLI, Terraform provider, and REST API."
        actions={
          <Button onClick={() => setOpen(true)} data-testid="create-api-key">
            <Plus data-icon="inline-start" /> Create key
          </Button>
        }
      />

      {state.apiKeys.some((k) => k.expiresAt && new Date(k.expiresAt) < NOW) && (
        <Alert>
          <AlertTriangle />
          <AlertTitle>Expired keys</AlertTitle>
          <AlertDescription>One or more keys have expired and will be rejected. Revoke them or create a replacement.</AlertDescription>
        </Alert>
      )}

      {state.apiKeys.length === 0 ? (
        <EmptyState icon={KeyRound} title="No API keys" description="Create a key to use the Orbit CLI or API." />
      ) : (
        <Card className="py-0">
          <Table data-testid="api-keys-table">
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Scopes</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last used</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.apiKeys.map((k) => {
                const expired = k.expiresAt !== null && new Date(k.expiresAt) < NOW;
                return (
                  <TableRow key={k.id} className={expired ? "opacity-60" : ""}>
                    <TableCell className="pl-4">
                      <div className="font-medium">{k.name}</div>
                      <div className="text-xs text-muted-foreground">by {k.createdBy}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{k.prefix}••••••••••••</TableCell>
                    <TableCell>
                      <div className="flex max-w-[280px] flex-wrap gap-1">
                        {k.scopes.map((s) => (
                          <Badge key={s} variant="outline" className="font-mono text-[10px]">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(k.createdAt)}</TableCell>
                    <TableCell className="text-muted-foreground">{k.lastUsedAt ? relativeTime(k.lastUsedAt) : "Never"}</TableCell>
                    <TableCell>
                      {k.expiresAt === null ? (
                        <span className="text-muted-foreground">Never</span>
                      ) : expired ? (
                        <Badge variant="destructive">Expired</Badge>
                      ) : (
                        <span className="text-muted-foreground">{formatDate(k.expiresAt)}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Revoke ${k.name}`} />}>
                          <Trash2 />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Revoke &quot;{k.name}&quot;?</AlertDialogTitle>
                            <AlertDialogDescription>Any integration using this key will immediately lose access. This cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-white hover:bg-destructive/90"
                              onClick={() => {
                                dispatch({ type: "key.revoke", id: k.id });
                                toast(`Revoked ${k.name}`);
                              }}
                            >
                              Revoke key
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) reset();
        }}
      >
        <DialogContent className="sm:max-w-lg" data-testid="create-api-key-dialog">
          <DialogHeader>
            <DialogTitle>Create API key</DialogTitle>
            <DialogDescription>Grant only the scopes this integration needs.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
              <div className="space-y-2">
                <Label htmlFor="key-name">Name</Label>
                <Input id="key-name" placeholder="CI — GitHub Actions" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Expiration</Label>
                <Select value={expiry} onValueChange={(v) => setExpiry(v as string)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Scopes</Label>
              <div className="max-h-64 space-y-3 overflow-auto rounded-lg border p-3">
                {scopeGroups.map((g) => (
                  <div key={g.label} className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">{g.label}</p>
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {g.scopes.map((s) => (
                        <Label key={s} className="flex items-center gap-2 font-mono text-xs font-normal">
                          <Checkbox checked={scopes.includes(s)} onCheckedChange={(c) => setScopes((sc) => (c ? [...sc, s] : sc.filter((x) => x !== s)))} />
                          {s}
                        </Label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={name.trim() === "" || scopes.length === 0}
              onClick={() => {
                const secret = `orb_live_${Math.random().toString(36).slice(2, 6)}${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`;
                dispatch({
                  type: "key.create",
                  key: {
                    id: nextId("key"),
                    name,
                    prefix: secret.slice(0, 13),
                    scopes,
                    createdAt: NOW.toISOString(),
                    lastUsedAt: null,
                    expiresAt: expiry === "never" ? null : new Date(NOW.getTime() + Number(expiry) * 86_400_000).toISOString(),
                    createdBy: "Sam Okafor",
                  },
                });
                setOpen(false);
                reset();
                setCreated(secret);
              }}
            >
              Create key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={created !== null} onOpenChange={(o) => !o && setCreated(null)}>
        <DialogContent className="sm:max-w-lg" showCloseButton={false} data-testid="api-key-reveal-dialog">
          <DialogHeader>
            <DialogTitle>Save your API key</DialogTitle>
            <DialogDescription>This is the only time the full key will be shown. Store it somewhere safe.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
            <code className="flex-1 break-all font-mono text-xs" data-testid="api-key-secret">
              {created}
            </code>
            {created && <CopyButton value={created} label="Copy key" />}
          </div>
          <Alert>
            <AlertTriangle />
            <AlertTitle>Treat this like a password</AlertTitle>
            <AlertDescription>Anyone with this key can act on your organization with the granted scopes.</AlertDescription>
          </Alert>
          <DialogFooter>
            <Button onClick={() => setCreated(null)}>I&apos;ve saved my key</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function ApiKeysPage() {
  return (
    <React.Suspense>
      <ApiKeysInner />
    </React.Suspense>
  );
}
