"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Mono, PageHeader } from "@/components/shared";
import { NOW, type Monitor } from "@/lib/data";
import { nextId, useStore } from "@/lib/store";

const steps = ["Endpoint", "Schedule & regions", "Alert conditions", "Review"];
const allRegions = ["us-east-1", "us-west-2", "eu-west-1", "eu-central-1", "ap-southeast-1", "ap-northeast-1"];
const channels = [
  { id: "#ops-alerts", label: "Slack #ops-alerts" },
  { id: "pager", label: "PagerDuty — Platform on-call" },
  { id: "email", label: "Email — ops@orbit.dev" },
  { id: "webhook", label: "Webhook — PagerDuty (wh_2)" },
];

export default function NewMonitorPage() {
  const router = useRouter();
  const { dispatch } = useStore();
  const [step, setStep] = React.useState(0);
  const [name, setName] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [method, setMethod] = React.useState<Monitor["method"]>("GET");
  const [body, setBody] = React.useState("");
  const [headers, setHeaders] = React.useState([{ k: "User-Agent", v: "Orbit-Monitor/1.0" }]);
  const [interval, setInterval_] = React.useState("60");
  const [regions, setRegions] = React.useState<string[]>(["us-east-1", "eu-west-1"]);
  const [expected, setExpected] = React.useState("200");
  const [threshold, setThreshold] = React.useState(800);
  const [failures, setFailures] = React.useState("3");
  const [bodyMatch, setBodyMatch] = React.useState("");
  const [alertChannels, setAlertChannels] = React.useState<string[]>(["#ops-alerts"]);
  const [escalate, setEscalate] = React.useState(true);
  const [escalateAfter, setEscalateAfter] = React.useState("10");

  const toggleIn = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const canContinue =
    step === 0 ? url.startsWith("http") && name.trim().length > 0 : step === 1 ? regions.length > 0 : step === 2 ? alertChannels.length > 0 : true;

  return (
    <>
      <PageHeader title="Create monitor" description="Check an endpoint on a schedule and alert your team when it fails." />

      <ol className="flex flex-wrap items-center gap-2 text-sm" data-testid="monitor-wizard-steps">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <li className={cn("flex items-center gap-2", i > step && "text-muted-foreground")}>
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full border text-xs font-medium",
                  i < step && "border-primary bg-primary text-primary-foreground",
                  i === step && "border-primary text-primary",
                )}
              >
                {i < step ? <Check className="size-3.5" /> : i + 1}
              </span>
              {s}
            </li>
            {i < steps.length - 1 && <span className="h-px w-8 bg-border" />}
          </React.Fragment>
        ))}
      </ol>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>{steps[step]}</CardTitle>
          <CardDescription>
            {step === 0 && "What should we check?"}
            {step === 1 && "How often, and from where?"}
            {step === 2 && "When is a check considered failed, and who gets notified?"}
            {step === 3 && "Confirm the configuration before creating the monitor."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {step === 0 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="mon-name">Name</Label>
                <Input id="mon-name" placeholder="Checkout API — /health" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <div className="space-y-2">
                  <Label>Method</Label>
                  <Select value={method} onValueChange={(v) => setMethod(v as Monitor["method"])}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="HEAD">HEAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mon-url">URL</Label>
                  <Input
                    id="mon-url"
                    placeholder="https://api.example.com/health"
                    className="font-mono text-xs"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    aria-invalid={url !== "" && !url.startsWith("http")}
                  />
                </div>
              </div>
              <Collapsible>
                <CollapsibleTrigger render={<Button variant="ghost" size="sm" />}>
                  <ChevronRight data-icon="inline-start" className="transition-transform [[data-panel-open]>&]:rotate-90" /> Advanced request options
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-3" data-testid="monitor-advanced">
                  <div className="space-y-2">
                    <Label>Headers</Label>
                    {headers.map((h, i) => (
                      <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                        <Input
                          placeholder="Header"
                          className="font-mono text-xs"
                          value={h.k}
                          onChange={(e) => setHeaders((hs) => hs.map((x, j) => (j === i ? { ...x, k: e.target.value } : x)))}
                        />
                        <Input
                          placeholder="Value"
                          className="font-mono text-xs"
                          value={h.v}
                          onChange={(e) => setHeaders((hs) => hs.map((x, j) => (j === i ? { ...x, v: e.target.value } : x)))}
                        />
                        <Button variant="ghost" size="icon" aria-label="Remove header" onClick={() => setHeaders((hs) => hs.filter((_, j) => j !== i))}>
                          <Trash2 />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => setHeaders((hs) => [...hs, { k: "", v: "" }])}>
                      <Plus data-icon="inline-start" /> Add header
                    </Button>
                  </div>
                  {method === "POST" && (
                    <div className="space-y-2">
                      <Label htmlFor="mon-body">Request body</Label>
                      <Textarea id="mon-body" className="font-mono text-xs" rows={4} placeholder='{"ping": true}' value={body} onChange={(e) => setBody(e.target.value)} />
                    </div>
                  )}
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">Follow redirects</p>
                      <p className="text-xs text-muted-foreground">Up to 5 redirects before the check fails.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">Verify TLS certificate</p>
                      <p className="text-xs text-muted-foreground">Fail the check if the certificate is invalid or expires within 7 days.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </>
          )}

          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label>Check interval</Label>
                <RadioGroup value={interval} onValueChange={(v) => setInterval_(v as string)} className="grid-cols-2 sm:grid-cols-4">
                  {[
                    ["15", "15 seconds"],
                    ["30", "30 seconds"],
                    ["60", "1 minute"],
                    ["300", "5 minutes"],
                  ].map(([v, l]) => (
                    <Label key={v} className="flex items-center gap-2 rounded-lg border p-3 font-normal has-data-checked:border-primary">
                      <RadioGroupItem value={v} /> {l}
                    </Label>
                  ))}
                </RadioGroup>
                <p className="text-xs text-muted-foreground">Intervals under 1 minute are available on the Business plan.</p>
              </div>
              <div className="space-y-2">
                <Label>Regions</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {allRegions.map((r) => (
                    <Label key={r} className="flex items-center gap-2 rounded-lg border p-3 font-mono text-xs font-normal has-data-checked:border-primary">
                      <Checkbox checked={regions.includes(r)} onCheckedChange={() => setRegions((rs) => toggleIn(rs, r))} /> {r}
                    </Label>
                  ))}
                </div>
                {regions.length === 0 && <p className="text-xs text-destructive">Select at least one region.</p>}
              </div>
            </>
          )}

          {step === 2 && (
            <div data-testid="monitor-alert-conditions" className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mon-status">Expected status code</Label>
                  <Input id="mon-status" value={expected} onChange={(e) => setExpected(e.target.value)} className="font-mono" />
                </div>
                <div className="space-y-2">
                  <Label>Consecutive failures before alerting</Label>
                  <Select value={failures} onValueChange={(v) => setFailures(v as string)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["1", "2", "3", "5"].map((n) => (
                        <SelectItem key={n} value={n}>
                          {n} {n === "1" ? "failure" : "failures"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Latency threshold</Label>
                  <span className="text-sm font-medium tabular-nums">{threshold} ms</span>
                </div>
                <Slider value={[threshold]} onValueChange={(v) => setThreshold(Array.isArray(v) ? v[0] : v)} min={100} max={5000} step={100} />
                <p className="text-xs text-muted-foreground">Responses slower than this count as failures.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mon-match">Response body must contain (optional)</Label>
                <Input id="mon-match" className="font-mono text-xs" placeholder='"status":"ok"' value={bodyMatch} onChange={(e) => setBodyMatch(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Notify</Label>
                <div className="space-y-2">
                  {channels.map((c) => (
                    <Label key={c.id} className="flex items-center gap-2 rounded-lg border p-3 font-normal has-data-checked:border-primary">
                      <Checkbox checked={alertChannels.includes(c.id)} onCheckedChange={() => setAlertChannels((cs) => toggleIn(cs, c.id))} /> {c.label}
                    </Label>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Escalate if unacknowledged</p>
                    <p className="text-xs text-muted-foreground">Page the secondary on-call if nobody acknowledges.</p>
                  </div>
                  <Switch checked={escalate} onCheckedChange={setEscalate} />
                </div>
                {escalate && (
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">After</span>
                    <Select value={escalateAfter} onValueChange={(v) => setEscalateAfter(v as string)}>
                      <SelectTrigger className="w-32" size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["5", "10", "15", "30"].map((n) => (
                          <SelectItem key={n} value={n}>
                            {n} minutes
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <dl className="grid grid-cols-[180px_1fr] gap-y-2 text-sm">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">{name}</dd>
              <dt className="text-muted-foreground">Request</dt>
              <dd>
                <Mono>
                  {method} {url}
                </Mono>
              </dd>
              <dt className="text-muted-foreground">Interval</dt>
              <dd>Every {interval}s</dd>
              <dt className="text-muted-foreground">Regions</dt>
              <dd className="font-mono text-xs">{regions.join(", ")}</dd>
              <dt className="text-muted-foreground">Failure condition</dt>
              <dd>
                Status ≠ {expected}, or latency &gt; {threshold} ms, {failures}× in a row
                {bodyMatch && (
                  <>
                    , or body missing <Mono>{bodyMatch}</Mono>
                  </>
                )}
              </dd>
              <dt className="text-muted-foreground">Notify</dt>
              <dd>{alertChannels.map((c) => channels.find((x) => x.id === c)?.label).join(", ")}</dd>
              <dt className="text-muted-foreground">Escalation</dt>
              <dd>{escalate ? `After ${escalateAfter} minutes unacknowledged` : "Off"}</dd>
            </dl>
          )}
        </CardContent>
        <CardFooter className="justify-between border-t">
          <Button variant="ghost" onClick={() => (step === 0 ? router.push("/monitors") : setStep(step - 1))}>
            <ChevronLeft data-icon="inline-start" /> {step === 0 ? "Cancel" : "Back"}
          </Button>
          {step < steps.length - 1 ? (
            <Button disabled={!canContinue} onClick={() => setStep(step + 1)}>
              Continue <ChevronRight data-icon="inline-end" />
            </Button>
          ) : (
            <Button
              onClick={() => {
                dispatch({
                  type: "monitor.create",
                  monitor: {
                    id: nextId("mon"),
                    name,
                    url,
                    method,
                    intervalSec: Number(interval),
                    regions,
                    status: "up",
                    uptime30d: 100,
                    avgLatencyMs: 0,
                    lastCheckedAt: NOW.toISOString(),
                    alertChannels,
                    thresholdMs: threshold,
                    expectedStatus: Number(expected),
                  },
                });
                toast.success("Monitor created", { description: "First check will run within a minute." });
                router.push("/monitors");
              }}
            >
              Create monitor
            </Button>
          )}
        </CardFooter>
      </Card>
    </>
  );
}
