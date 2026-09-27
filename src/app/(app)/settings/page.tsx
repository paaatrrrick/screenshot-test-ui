"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Check, CreditCard, GitBranch, MessageSquare, Hash, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
import { Mono, PageHeader } from "@/components/shared";
import { org } from "@/lib/data";
import { formatDate } from "@/lib/format";

const tabs = ["general", "billing", "integrations", "notifications", "security"] as const;

const invoices = [
  { id: "INV-2026-009", date: "2026-09-01", amount: "$1,188.00", status: "paid" },
  { id: "INV-2026-008", date: "2026-08-01", amount: "$1,092.00", status: "paid" },
  { id: "INV-2026-007", date: "2026-07-01", amount: "$1,140.00", status: "paid" },
  { id: "INV-2026-006", date: "2026-06-01", amount: "$996.00", status: "paid" },
];

function SettingsInner() {
  const params = useSearchParams();
  const initial = params.get("tab") as (typeof tabs)[number] | null;
  const [tab, setTab] = React.useState<(typeof tabs)[number]>(initial && tabs.includes(initial) ? initial : "general");

  return (
    <>
      <PageHeader title="Settings" description="Organization-wide configuration for Orbit Labs." />
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} orientation="vertical" className="gap-6 lg:flex-row">
        <TabsList variant="line" className="w-full lg:w-48 lg:flex-col lg:items-stretch" data-testid="settings-tabs">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="max-w-3xl space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
              <CardDescription>Name, URL, and default region for new projects.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="org-name">Name</Label>
                <Input id="org-name" defaultValue={org.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-slug">Slug</Label>
                <div className="flex items-center">
                  <span className="flex h-8 items-center rounded-l-lg border border-r-0 bg-muted px-2 text-xs text-muted-foreground">orbit.dev/</span>
                  <Input id="org-slug" defaultValue={org.slug} className="rounded-l-none font-mono text-xs" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Default region</Label>
                <Select defaultValue="us-east-1">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1"].map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select defaultValue="utc">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="pt">America/Los_Angeles</SelectItem>
                    <SelectItem value="et">America/New_York</SelectItem>
                    <SelectItem value="cet">Europe/Berlin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t">
              <Button onClick={() => toast.success("Organization updated")}>Save changes</Button>
            </CardFooter>
          </Card>
          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="text-destructive">Danger zone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border border-destructive/40 p-3">
                <div>
                  <p className="text-sm font-medium">Delete organization</p>
                  <p className="text-xs text-muted-foreground">Permanently delete Orbit Labs and all {8} projects.</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger render={<Button variant="destructive" />}>
                    <Trash2 data-icon="inline-start" /> Delete
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Orbit Labs?</AlertDialogTitle>
                      <AlertDialogDescription>Only the organization owner can do this, and it requires confirmation by email. All data is purged after 30 days.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={() => toast("Confirmation email sent to sam@orbit.dev")}>
                        Send confirmation email
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="max-w-3xl space-y-4" data-testid="billing-tab">
          <Card>
            <CardHeader>
              <CardTitle>Current plan</CardTitle>
              <CardDescription>Renews {formatDate(org.renewsAt)} · billed annually to {org.billingEmail}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              {[
                { name: "Team", price: "$20", unit: "/seat/mo", current: false, features: ["10 projects", "100M requests", "7-day logs"] },
                { name: "Business", price: "$60", unit: "/seat/mo", current: true, features: ["Unlimited projects", "1B requests", "30-day logs", "SSO & audit log"] },
                { name: "Enterprise", price: "Custom", unit: "", current: false, features: ["Dedicated regions", "99.99% SLA", "HIPAA / SOC 2 reports"] },
              ].map((p) => (
                <div key={p.name} className={`rounded-lg border p-4 ${p.current ? "border-primary" : ""}`}>
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{p.name}</p>
                    {p.current && <Badge>Current</Badge>}
                  </div>
                  <p className="mt-2 text-2xl font-semibold">
                    {p.price}
                    <span className="text-xs font-normal text-muted-foreground">{p.unit}</span>
                  </p>
                  <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-1.5">
                        <Check className="size-3" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button variant={p.current ? "outline" : "default"} size="sm" className="mt-4 w-full" disabled={p.current} onClick={() => toast(`${p.name === "Enterprise" ? "Sales will reach out" : `Switched to ${p.name}`}`)}>
                    {p.current ? "Current plan" : p.name === "Enterprise" ? "Contact sales" : p.name === "Team" ? "Downgrade" : "Upgrade"}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Payment method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <CreditCard className="size-5 text-muted-foreground" />
                <div className="flex-1 text-sm">
                  <p className="font-medium">Visa ending in 4242</p>
                  <p className="text-xs text-muted-foreground">Expires 08/2029</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast("Opening Stripe billing portal…")}>
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="pl-4 font-mono text-xs">{inv.id}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(inv.date)}</TableCell>
                    <TableCell className="tabular-nums">{inv.amount}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 capitalize dark:text-emerald-400">
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="xs" onClick={() => toast(`Downloading ${inv.id}.pdf`)}>
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="max-w-3xl space-y-3">
          {[
            { icon: GitBranch, name: "GitHub", desc: "Import repositories and deploy on push.", connected: true, detail: "orbit-labs · 14 repositories" },
            { icon: Hash, name: "Slack", desc: "Deployment and incident notifications.", connected: true, detail: "Orbit Labs workspace · #deploys, #ops-alerts" },
            { icon: MessageSquare, name: "PagerDuty", desc: "Page on-call for critical incidents.", connected: true, detail: "Platform on-call schedule" },
            { icon: CreditCard, name: "Datadog", desc: "Forward logs and metrics.", connected: false, detail: "" },
            { icon: MessageSquare, name: "Linear", desc: "Create issues from incidents.", connected: false, detail: "" },
          ].map((i) => (
            <Card key={i.name} size="sm">
              <CardContent className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                  <i.icon className="size-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{i.name}</p>
                  <p className="text-xs text-muted-foreground">{i.connected ? i.detail : i.desc}</p>
                </div>
                {i.connected ? (
                  <>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                      Connected
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => toast(`${i.name} settings`)}>
                      Configure
                    </Button>
                  </>
                ) : (
                  <Button size="sm" onClick={() => toast(`Redirecting to ${i.name}…`)}>
                    Connect
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="notifications" className="max-w-3xl space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email notifications</CardTitle>
              <CardDescription>Sent to sam@orbit.dev</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                ["Deployment failures", "When a production build fails.", true],
                ["Incident updates", "Opened, acknowledged, and resolved.", true],
                ["Weekly digest", "Usage, uptime, and deployment summary every Monday.", true],
                ["Usage alerts", "When you reach 80% and 100% of a plan limit.", true],
                ["Product updates", "New features and changelog.", false],
              ].map(([t, d, on]) => (
                <div key={t as string} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{t as string}</p>
                    <p className="text-xs text-muted-foreground">{d as string}</p>
                  </div>
                  <Switch defaultChecked={on as boolean} />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Slack routing</CardTitle>
              <CardDescription>Which channel receives each event type.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion>
                {[
                  ["Deployments", "#deploys"],
                  ["Incidents", "#ops-alerts"],
                  ["Feature flags", "#product"],
                ].map(([t, ch]) => (
                  <AccordionItem key={t} value={t}>
                    <AccordionTrigger>
                      {t} <Mono>{ch}</Mono>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <div className="space-y-2">
                        <Label>Channel</Label>
                        <Input defaultValue={ch} className="font-mono text-xs" />
                      </div>
                      <div className="space-y-2">
                        <Label>Message template</Label>
                        <Textarea rows={2} defaultValue={`{{event}} in {{project}} by {{actor}} — {{url}}`} className="font-mono text-xs" />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="max-w-3xl space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Require two-factor authentication</p>
                  <p className="text-xs text-muted-foreground">Members without 2FA will be locked out after the grace period. 2 members are not yet enrolled.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">SAML single sign-on</p>
                  <p className="text-xs text-muted-foreground">Okta · orbit-labs.okta.com</p>
                </div>
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  Active
                </Badge>
              </div>
              <div className="space-y-2">
                <Label>Session duration</Label>
                <Select defaultValue="7d">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1d">1 day</SelectItem>
                    <SelectItem value="7d">7 days</SelectItem>
                    <SelectItem value="30d">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>IP allowlist</CardTitle>
              <CardDescription>Restrict dashboard and API access to these CIDR ranges.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Textarea rows={3} defaultValue={"203.0.113.0/24\n198.51.100.0/24"} className="font-mono text-xs" />
              <p className="text-xs text-muted-foreground">One range per line. Your current IP is 203.0.113.9.</p>
            </CardContent>
            <CardFooter className="justify-end border-t">
              <Button onClick={() => toast.success("Allowlist updated")}>Save</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

export default function SettingsPage() {
  return (
    <React.Suspense>
      <SettingsInner />
    </React.Suspense>
  );
}
