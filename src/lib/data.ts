export const NOW = new Date("2026-09-27T15:00:00Z");

export type ProjectStatus = "healthy" | "degraded" | "down" | "paused";
export type DeployStatus = "ready" | "building" | "error" | "queued" | "canceled";
export type Environment = "production" | "preview" | "staging" | "development";
export type LogLevel = "debug" | "info" | "warn" | "error";
export type Role = "owner" | "admin" | "developer" | "viewer";
export type Severity = "critical" | "high" | "medium" | "low";

export interface Project {
  slug: string;
  name: string;
  framework: string;
  repo: string;
  region: string;
  status: ProjectStatus;
  productionUrl: string;
  createdAt: string;
  lastDeployedAt: string | null;
  requests24h: number;
  errorRate: number;
  p95Ms: number;
}

export interface Deployment {
  id: string;
  projectSlug: string;
  environment: Environment;
  status: DeployStatus;
  commit: string;
  message: string;
  branch: string;
  author: string;
  createdAt: string;
  durationSec: number | null;
  url: string;
  region: string;
  logs: { ts: string; level: LogLevel; text: string }[];
}

export interface EnvVar {
  id: string;
  projectSlug: string;
  key: string;
  value: string;
  environments: Environment[];
  secret: boolean;
  updatedAt: string;
}

export interface Domain {
  id: string;
  projectSlug: string;
  host: string;
  verified: boolean;
  ssl: "active" | "pending" | "failed";
  primary: boolean;
}

export interface LogEntry {
  id: string;
  ts: string;
  level: LogLevel;
  service: string;
  message: string;
  requestId: string;
  meta: Record<string, unknown>;
}

export interface FlagRule {
  id: string;
  attribute: string;
  operator: "is" | "is_not" | "contains" | "starts_with" | "in";
  value: string;
  serve: boolean;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  environments: Record<"production" | "staging" | "development", boolean>;
  rollout: number;
  rules: FlagRule[];
  tags: string[];
  owner: string;
  updatedAt: string;
}

export interface Monitor {
  id: string;
  name: string;
  url: string;
  method: "GET" | "POST" | "HEAD";
  intervalSec: number;
  regions: string[];
  status: "up" | "down" | "paused" | "degraded";
  uptime30d: number;
  avgLatencyMs: number;
  lastCheckedAt: string;
  alertChannels: string[];
  thresholdMs: number;
  expectedStatus: number;
}

export interface Incident {
  id: string;
  title: string;
  severity: Severity;
  status: "open" | "acknowledged" | "resolved";
  service: string;
  startedAt: string;
  resolvedAt: string | null;
  assignee: string | null;
  updates: { ts: string; author: string; text: string }[];
}

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdBy: string;
}

export interface Webhook {
  id: string;
  url: string;
  description: string;
  events: string[];
  active: boolean;
  secretPrefix: string;
  createdAt: string;
  deliveries: { id: string; ts: string; event: string; status: number; durationMs: number }[];
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  joinedAt: string;
  lastActiveAt: string;
  twoFactor: boolean;
  status: "active" | "invited" | "suspended";
}

export interface AuditEvent {
  id: string;
  ts: string;
  actor: string;
  action: string;
  target: string;
  ip: string;
  details: string;
}

const ago = (hours: number) => new Date(NOW.getTime() - hours * 3600_000).toISOString();
const daysAgo = (d: number) => ago(d * 24);

export const projects: Project[] = [
  {
    slug: "atlas-api",
    name: "Atlas API",
    framework: "Node.js / Fastify",
    repo: "orbit-labs/atlas-api",
    region: "us-east-1",
    status: "healthy",
    productionUrl: "https://api.atlas.orbit.dev",
    createdAt: daysAgo(412),
    lastDeployedAt: ago(1.5),
    requests24h: 4_812_330,
    errorRate: 0.12,
    p95Ms: 184,
  },
  {
    slug: "atlas-web",
    name: "Atlas Web",
    framework: "Next.js",
    repo: "orbit-labs/atlas-web",
    region: "us-east-1",
    status: "healthy",
    productionUrl: "https://atlas.orbit.dev",
    createdAt: daysAgo(398),
    lastDeployedAt: ago(4),
    requests24h: 1_209_874,
    errorRate: 0.04,
    p95Ms: 312,
  },
  {
    slug: "billing-worker",
    name: "Billing Worker",
    framework: "Go",
    repo: "orbit-labs/billing-worker",
    region: "eu-west-1",
    status: "degraded",
    productionUrl: "https://billing.orbit.dev",
    createdAt: daysAgo(210),
    lastDeployedAt: ago(0.4),
    requests24h: 88_120,
    errorRate: 3.8,
    p95Ms: 1_240,
  },
  {
    slug: "docs-site",
    name: "Docs Site",
    framework: "Astro",
    repo: "orbit-labs/docs",
    region: "global",
    status: "healthy",
    productionUrl: "https://docs.orbit.dev",
    createdAt: daysAgo(160),
    lastDeployedAt: daysAgo(2),
    requests24h: 402_551,
    errorRate: 0.01,
    p95Ms: 92,
  },
  {
    slug: "ingest-pipeline",
    name: "Ingest Pipeline",
    framework: "Python / FastAPI",
    repo: "orbit-labs/ingest",
    region: "us-west-2",
    status: "down",
    productionUrl: "https://ingest.orbit.dev",
    createdAt: daysAgo(95),
    lastDeployedAt: ago(0.2),
    requests24h: 12_004_115,
    errorRate: 41.2,
    p95Ms: 4_820,
  },
  {
    slug: "mobile-gateway",
    name: "Mobile Gateway",
    framework: "Rust / Axum",
    repo: "orbit-labs/mobile-gateway",
    region: "ap-southeast-1",
    status: "healthy",
    productionUrl: "https://m.orbit.dev",
    createdAt: daysAgo(72),
    lastDeployedAt: daysAgo(6),
    requests24h: 2_340_009,
    errorRate: 0.22,
    p95Ms: 141,
  },
  {
    slug: "legacy-cron",
    name: "Legacy Cron",
    framework: "Ruby",
    repo: "orbit-labs/legacy-cron",
    region: "us-east-1",
    status: "paused",
    productionUrl: "https://cron.orbit.dev",
    createdAt: daysAgo(890),
    lastDeployedAt: daysAgo(140),
    requests24h: 0,
    errorRate: 0,
    p95Ms: 0,
  },
  {
    slug: "sandbox-playground",
    name: "Sandbox Playground",
    framework: "Next.js",
    repo: "orbit-labs/sandbox",
    region: "us-east-1",
    status: "healthy",
    productionUrl: "https://sandbox.orbit.dev",
    createdAt: ago(3),
    lastDeployedAt: null,
    requests24h: 0,
    errorRate: 0,
    p95Ms: 0,
  },
];

const buildLogs = (ok: boolean, framework: string) => {
  const base = [
    { ts: "00:00.000", level: "info" as LogLevel, text: "Cloning repository (branch: main, commit: 9f3c2ab)" },
    { ts: "00:01.204", level: "info" as LogLevel, text: "Cloned in 1.2s" },
    { ts: "00:01.310", level: "info" as LogLevel, text: `Detected framework: ${framework}` },
    { ts: "00:01.322", level: "info" as LogLevel, text: "Restoring build cache from previous deployment" },
    { ts: "00:03.980", level: "info" as LogLevel, text: "Cache restored (214 MB)" },
    { ts: "00:04.011", level: "info" as LogLevel, text: "Running \"pnpm install --frozen-lockfile\"" },
    { ts: "00:19.442", level: "debug" as LogLevel, text: "Packages: +1284 (reused 1284, downloaded 0)" },
    { ts: "00:19.500", level: "info" as LogLevel, text: "Running \"pnpm build\"" },
    { ts: "00:21.900", level: "warn" as LogLevel, text: "Deprecation: `experimental.serverActions` is now enabled by default" },
    { ts: "00:48.223", level: "info" as LogLevel, text: "Compiled 142 routes" },
  ];
  return ok
    ? [
        ...base,
        { ts: "00:52.007", level: "info" as LogLevel, text: "Build completed in 48s" },
        { ts: "00:53.100", level: "info" as LogLevel, text: "Uploading build outputs (38.2 MB)" },
        { ts: "00:56.481", level: "info" as LogLevel, text: "Deployment ready" },
      ]
    : [
        ...base,
        { ts: "00:49.114", level: "error" as LogLevel, text: "src/routes/invoices.ts(88,14): error TS2339: Property 'totalCents' does not exist on type 'Invoice'." },
        { ts: "00:49.115", level: "error" as LogLevel, text: "Found 1 error. Watching for file changes." },
        { ts: "00:49.200", level: "error" as LogLevel, text: "Command \"pnpm build\" exited with 1" },
        { ts: "00:49.201", level: "error" as LogLevel, text: "Build failed" },
      ];
};

export const deployments: Deployment[] = [
  {
    id: "dpl_8f2k1a",
    projectSlug: "atlas-api",
    environment: "production",
    status: "ready",
    commit: "9f3c2ab",
    message: "feat(auth): rotate refresh tokens on password change",
    branch: "main",
    author: "Maya Chen",
    createdAt: ago(1.5),
    durationSec: 56,
    url: "https://atlas-api-9f3c2ab.orbit.app",
    region: "us-east-1",
    logs: buildLogs(true, "Node.js"),
  },
  {
    id: "dpl_7d3m0q",
    projectSlug: "billing-worker",
    environment: "production",
    status: "error",
    commit: "b17e04c",
    message: "fix(invoices): compute totals in minor units",
    branch: "main",
    author: "Tomás Reyes",
    createdAt: ago(0.4),
    durationSec: 49,
    url: "https://billing-worker-b17e04c.orbit.app",
    region: "eu-west-1",
    logs: buildLogs(false, "Go"),
  },
  {
    id: "dpl_5c9x2p",
    projectSlug: "ingest-pipeline",
    environment: "production",
    status: "building",
    commit: "40aa91d",
    message: "chore: bump kafka client to 3.7",
    branch: "main",
    author: "Priya Nair",
    createdAt: ago(0.2),
    durationSec: null,
    url: "https://ingest-40aa91d.orbit.app",
    region: "us-west-2",
    logs: buildLogs(true, "Python").slice(0, 8),
  },
  {
    id: "dpl_3b8n7r",
    projectSlug: "atlas-web",
    environment: "preview",
    status: "ready",
    commit: "c2d9e11",
    message: "redesign pricing table with annual toggle",
    branch: "feat/pricing-v2",
    author: "Jordan Ellis",
    createdAt: ago(3),
    durationSec: 71,
    url: "https://atlas-web-git-feat-pricing-v2.orbit.app",
    region: "us-east-1",
    logs: buildLogs(true, "Next.js"),
  },
  {
    id: "dpl_2a7l6s",
    projectSlug: "atlas-web",
    environment: "production",
    status: "ready",
    commit: "e8f1a03",
    message: "fix: hydration mismatch on locale switch",
    branch: "main",
    author: "Maya Chen",
    createdAt: ago(4),
    durationSec: 68,
    url: "https://atlas-web-e8f1a03.orbit.app",
    region: "us-east-1",
    logs: buildLogs(true, "Next.js"),
  },
  {
    id: "dpl_1z6k5t",
    projectSlug: "atlas-api",
    environment: "staging",
    status: "queued",
    commit: "77b3c0e",
    message: "perf: batch webhook fan-out",
    branch: "perf/webhook-batching",
    author: "Sam Okafor",
    createdAt: ago(0.05),
    durationSec: null,
    url: "https://atlas-api-git-perf-webhook-batching.orbit.app",
    region: "us-east-1",
    logs: [],
  },
  {
    id: "dpl_0y5j4u",
    projectSlug: "docs-site",
    environment: "production",
    status: "ready",
    commit: "1a2b3c4",
    message: "docs: add webhooks retry policy",
    branch: "main",
    author: "Priya Nair",
    createdAt: daysAgo(2),
    durationSec: 24,
    url: "https://docs-1a2b3c4.orbit.app",
    region: "global",
    logs: buildLogs(true, "Astro"),
  },
  {
    id: "dpl_9x4i3v",
    projectSlug: "mobile-gateway",
    environment: "production",
    status: "canceled",
    commit: "5d6e7f8",
    message: "wip: experiment with http/3",
    branch: "exp/h3",
    author: "Jordan Ellis",
    createdAt: daysAgo(5),
    durationSec: 12,
    url: "https://mobile-gateway-5d6e7f8.orbit.app",
    region: "ap-southeast-1",
    logs: buildLogs(true, "Rust").slice(0, 4),
  },
  {
    id: "dpl_8w3h2w",
    projectSlug: "mobile-gateway",
    environment: "production",
    status: "ready",
    commit: "6e7f8a9",
    message: "feat: device attestation for iOS 19",
    branch: "main",
    author: "Sam Okafor",
    createdAt: daysAgo(6),
    durationSec: 133,
    url: "https://mobile-gateway-6e7f8a9.orbit.app",
    region: "ap-southeast-1",
    logs: buildLogs(true, "Rust"),
  },
  {
    id: "dpl_7v2g1x",
    projectSlug: "atlas-api",
    environment: "production",
    status: "ready",
    commit: "aa01b2c",
    message: "fix: null-safe org lookup in rate limiter",
    branch: "main",
    author: "Tomás Reyes",
    createdAt: daysAgo(1.2),
    durationSec: 58,
    url: "https://atlas-api-aa01b2c.orbit.app",
    region: "us-east-1",
    logs: buildLogs(true, "Node.js"),
  },
  {
    id: "dpl_6u1f0y",
    projectSlug: "billing-worker",
    environment: "production",
    status: "ready",
    commit: "0c1d2e3",
    message: "feat: proration on plan downgrade",
    branch: "main",
    author: "Tomás Reyes",
    createdAt: daysAgo(3),
    durationSec: 44,
    url: "https://billing-worker-0c1d2e3.orbit.app",
    region: "eu-west-1",
    logs: buildLogs(true, "Go"),
  },
  {
    id: "dpl_5t0e9z",
    projectSlug: "atlas-web",
    environment: "preview",
    status: "error",
    commit: "f0e1d2c",
    message: "try new image loader",
    branch: "spike/image-loader",
    author: "Jordan Ellis",
    createdAt: daysAgo(4),
    durationSec: 39,
    url: "https://atlas-web-git-spike-image-loader.orbit.app",
    region: "us-east-1",
    logs: buildLogs(false, "Next.js"),
  },
];

export const envVars: EnvVar[] = [
  { id: "env_1", projectSlug: "atlas-api", key: "DATABASE_URL", value: "postgres://atlas:s3cr3t@db.internal:5432/atlas", environments: ["production"], secret: true, updatedAt: daysAgo(12) },
  { id: "env_2", projectSlug: "atlas-api", key: "DATABASE_URL", value: "postgres://atlas:dev@localhost:5432/atlas_dev", environments: ["preview", "development"], secret: true, updatedAt: daysAgo(40) },
  { id: "env_3", projectSlug: "atlas-api", key: "REDIS_URL", value: "redis://cache.internal:6379/0", environments: ["production", "preview"], secret: true, updatedAt: daysAgo(12) },
  { id: "env_4", projectSlug: "atlas-api", key: "LOG_LEVEL", value: "info", environments: ["production"], secret: false, updatedAt: daysAgo(90) },
  { id: "env_5", projectSlug: "atlas-api", key: "LOG_LEVEL", value: "debug", environments: ["preview", "development"], secret: false, updatedAt: daysAgo(90) },
  { id: "env_6", projectSlug: "atlas-api", key: "STRIPE_SECRET_KEY", value: "sk_live_51NxA9kL2mQpR7tUvWxYz0123456789", environments: ["production"], secret: true, updatedAt: daysAgo(3) },
  { id: "env_7", projectSlug: "atlas-api", key: "JWT_ISSUER", value: "https://auth.orbit.dev", environments: ["production", "preview", "development"], secret: false, updatedAt: daysAgo(200) },
  { id: "env_8", projectSlug: "atlas-api", key: "FEATURE_FLAGS_SDK_KEY", value: "ff_srv_4f8a2c9e1b7d3f6a", environments: ["production"], secret: true, updatedAt: daysAgo(1) },
  { id: "env_9", projectSlug: "atlas-web", key: "NEXT_PUBLIC_API_URL", value: "https://api.atlas.orbit.dev", environments: ["production"], secret: false, updatedAt: daysAgo(30) },
  { id: "env_10", projectSlug: "atlas-web", key: "NEXT_PUBLIC_API_URL", value: "https://api-staging.atlas.orbit.dev", environments: ["preview"], secret: false, updatedAt: daysAgo(30) },
  { id: "env_11", projectSlug: "atlas-web", key: "SENTRY_DSN", value: "https://a1b2c3@o123.ingest.sentry.io/456", environments: ["production", "preview"], secret: true, updatedAt: daysAgo(55) },
  { id: "env_12", projectSlug: "billing-worker", key: "STRIPE_WEBHOOK_SECRET", value: "whsec_8f7e6d5c4b3a29181716151413121110", environments: ["production"], secret: true, updatedAt: daysAgo(3) },
  { id: "env_13", projectSlug: "billing-worker", key: "BATCH_SIZE", value: "250", environments: ["production", "preview"], secret: false, updatedAt: daysAgo(8) },
  { id: "env_14", projectSlug: "ingest-pipeline", key: "KAFKA_BROKERS", value: "kafka-1.internal:9092,kafka-2.internal:9092,kafka-3.internal:9092", environments: ["production"], secret: false, updatedAt: daysAgo(15) },
  { id: "env_15", projectSlug: "ingest-pipeline", key: "KAFKA_SASL_PASSWORD", value: "K4fk4-Pr0d-P@ssw0rd!", environments: ["production"], secret: true, updatedAt: daysAgo(15) },
];

export const domains: Domain[] = [
  { id: "dom_1", projectSlug: "atlas-api", host: "api.atlas.orbit.dev", verified: true, ssl: "active", primary: true },
  { id: "dom_2", projectSlug: "atlas-api", host: "atlas-api.orbit.app", verified: true, ssl: "active", primary: false },
  { id: "dom_3", projectSlug: "atlas-web", host: "atlas.orbit.dev", verified: true, ssl: "active", primary: true },
  { id: "dom_4", projectSlug: "atlas-web", host: "www.atlas.orbit.dev", verified: true, ssl: "active", primary: false },
  { id: "dom_5", projectSlug: "atlas-web", host: "atlas-app.com", verified: false, ssl: "pending", primary: false },
  { id: "dom_6", projectSlug: "billing-worker", host: "billing.orbit.dev", verified: true, ssl: "active", primary: true },
  { id: "dom_7", projectSlug: "docs-site", host: "docs.orbit.dev", verified: true, ssl: "active", primary: true },
  { id: "dom_8", projectSlug: "ingest-pipeline", host: "ingest.orbit.dev", verified: true, ssl: "failed", primary: true },
  { id: "dom_9", projectSlug: "mobile-gateway", host: "m.orbit.dev", verified: true, ssl: "active", primary: true },
];

const services = ["atlas-api", "atlas-web", "billing-worker", "ingest-pipeline", "mobile-gateway"];
const logMessages: [LogLevel, string, Record<string, unknown>][] = [
  ["info", "GET /v1/orgs/org_2ax9/members 200 in 42ms", { method: "GET", path: "/v1/orgs/org_2ax9/members", status: 200, durationMs: 42, userId: "usr_18k3" }],
  ["warn", "Rate limit approaching for org_2ax9 (912/1000 rpm)", { orgId: "org_2ax9", current: 912, limit: 1000, window: "1m" }],
  ["error", "Unhandled rejection: TypeError: Cannot read properties of undefined (reading 'totalCents')", { stack: "at computeTotals (src/routes/invoices.ts:88:14)\nat processTicksAndRejections (node:internal/process/task_queues:95:5)", invoiceId: "inv_00f8" }],
  ["info", "POST /v1/checkout/sessions 201 in 318ms", { method: "POST", path: "/v1/checkout/sessions", status: 201, durationMs: 318, amountCents: 12900, currency: "usd" }],
  ["debug", "cache hit key=org:org_2ax9:plan ttl=412s", { key: "org:org_2ax9:plan", ttl: 412, layer: "redis" }],
  ["error", "Kafka consumer lag exceeded threshold (partition 7, lag 128,404)", { topic: "events.raw", partition: 7, lag: 128404, threshold: 50000 }],
  ["info", "Rendered /pricing (ISR revalidate=300) in 88ms", { route: "/pricing", revalidate: 300, durationMs: 88, cache: "STALE" }],
  ["warn", "Slow query (1,204ms): SELECT * FROM invoices WHERE org_id = $1 ORDER BY created_at DESC", { durationMs: 1204, rows: 4812, table: "invoices" }],
  ["info", "Webhook delivered evt_4x1 to https://hooks.example.com/orbit (200, 143ms)", { eventId: "evt_4x1", status: 200, durationMs: 143, attempt: 1 }],
  ["error", "Webhook delivery failed evt_4x2 (503 Service Unavailable), retrying in 30s", { eventId: "evt_4x2", status: 503, attempt: 2, nextRetrySec: 30 }],
  ["info", "Device attestation verified for device_9k2 (iOS 19.1)", { deviceId: "device_9k2", platform: "ios", os: "19.1", durationMs: 61 }],
  ["debug", "Feature flag evaluation new-dashboard => true (rule: beta_users)", { flag: "new-dashboard", result: true, rule: "beta_users", userId: "usr_18k3" }],
  ["info", "Health check OK (uptime 41d 3h)", { uptimeSec: 3553200, memoryMb: 412, cpuPct: 12.4 }],
  ["warn", "Deprecated API version 2024-01-01 used by org_7bb1", { orgId: "org_7bb1", version: "2024-01-01", sunset: "2027-01-01" }],
  ["error", "Connection refused: postgres://db.internal:5432 (retry 3/5)", { host: "db.internal", port: 5432, attempt: 3, maxAttempts: 5 }],
  ["info", "Flushed 2,048 events to warehouse in 940ms", { count: 2048, durationMs: 940, sink: "bigquery" }],
];

export const logs: LogEntry[] = Array.from({ length: 120 }, (_, i) => {
  const [level, message, meta] = logMessages[i % logMessages.length];
  const service = services[(i * 7) % services.length];
  return {
    id: `log_${String(i).padStart(4, "0")}`,
    ts: new Date(NOW.getTime() - i * 47_000 - (i % 5) * 3_100).toISOString(),
    level,
    service,
    message,
    requestId: `req_${(0x9a3f0000 + i * 7919).toString(16)}`,
    meta: { ...meta, service, region: i % 3 === 0 ? "us-east-1" : i % 3 === 1 ? "eu-west-1" : "ap-southeast-1", host: `${service}-${(i % 4) + 1}` },
  };
});

export const flags: FeatureFlag[] = [
  {
    id: "flg_1",
    key: "new-dashboard",
    name: "New dashboard",
    description: "Redesigned overview dashboard with live metrics and incident feed.",
    enabled: true,
    environments: { production: true, staging: true, development: true },
    rollout: 25,
    rules: [
      { id: "r1", attribute: "plan", operator: "is", value: "enterprise", serve: true },
      { id: "r2", attribute: "email", operator: "contains", value: "@orbit.dev", serve: true },
    ],
    tags: ["frontend", "beta"],
    owner: "Maya Chen",
    updatedAt: ago(6),
  },
  {
    id: "flg_2",
    key: "checkout-v2",
    name: "Checkout v2",
    description: "New checkout flow with saved payment methods and Apple Pay.",
    enabled: true,
    environments: { production: false, staging: true, development: true },
    rollout: 100,
    rules: [{ id: "r3", attribute: "country", operator: "in", value: "US, CA, GB", serve: true }],
    tags: ["billing"],
    owner: "Tomás Reyes",
    updatedAt: daysAgo(1),
  },
  {
    id: "flg_3",
    key: "ai-log-summaries",
    name: "AI log summaries",
    description: "Summarize error clusters in the log explorer using the LLM pipeline.",
    enabled: false,
    environments: { production: false, staging: false, development: true },
    rollout: 0,
    rules: [],
    tags: ["ai", "experimental"],
    owner: "Priya Nair",
    updatedAt: daysAgo(3),
  },
  {
    id: "flg_4",
    key: "kill-switch-webhooks",
    name: "Kill switch: webhooks",
    description: "Emergency switch that pauses all outbound webhook deliveries.",
    enabled: false,
    environments: { production: false, staging: false, development: false },
    rollout: 100,
    rules: [],
    tags: ["ops", "kill-switch"],
    owner: "Sam Okafor",
    updatedAt: daysAgo(30),
  },
  {
    id: "flg_5",
    key: "http3-gateway",
    name: "HTTP/3 on mobile gateway",
    description: "Serve mobile gateway traffic over QUIC for supported clients.",
    enabled: true,
    environments: { production: true, staging: true, development: true },
    rollout: 5,
    rules: [{ id: "r4", attribute: "platform", operator: "is", value: "ios", serve: true }],
    tags: ["infra"],
    owner: "Jordan Ellis",
    updatedAt: daysAgo(7),
  },
  {
    id: "flg_6",
    key: "usage-based-billing",
    name: "Usage-based billing",
    description: "Meter requests and bandwidth per project and bill overages monthly.",
    enabled: true,
    environments: { production: true, staging: true, development: true },
    rollout: 100,
    rules: [{ id: "r5", attribute: "plan", operator: "is_not", value: "free", serve: true }],
    tags: ["billing"],
    owner: "Tomás Reyes",
    updatedAt: daysAgo(14),
  },
  {
    id: "flg_7",
    key: "dark-mode-default",
    name: "Dark mode by default",
    description: "New accounts start in dark mode.",
    enabled: false,
    environments: { production: false, staging: true, development: true },
    rollout: 50,
    rules: [],
    tags: ["frontend"],
    owner: "Maya Chen",
    updatedAt: daysAgo(21),
  },
];

export const monitors: Monitor[] = [
  { id: "mon_1", name: "Atlas API — /health", url: "https://api.atlas.orbit.dev/health", method: "GET", intervalSec: 30, regions: ["us-east-1", "eu-west-1", "ap-southeast-1"], status: "up", uptime30d: 99.98, avgLatencyMs: 112, lastCheckedAt: ago(0.01), alertChannels: ["#ops-alerts", "pager"], thresholdMs: 800, expectedStatus: 200 },
  { id: "mon_2", name: "Atlas Web — homepage", url: "https://atlas.orbit.dev/", method: "GET", intervalSec: 60, regions: ["us-east-1", "eu-west-1"], status: "up", uptime30d: 99.99, avgLatencyMs: 241, lastCheckedAt: ago(0.02), alertChannels: ["#ops-alerts"], thresholdMs: 1500, expectedStatus: 200 },
  { id: "mon_3", name: "Billing worker — heartbeat", url: "https://billing.orbit.dev/heartbeat", method: "HEAD", intervalSec: 60, regions: ["eu-west-1"], status: "degraded", uptime30d: 99.41, avgLatencyMs: 1_180, lastCheckedAt: ago(0.01), alertChannels: ["#billing", "pager"], thresholdMs: 1000, expectedStatus: 204 },
  { id: "mon_4", name: "Ingest — accept endpoint", url: "https://ingest.orbit.dev/v1/events", method: "POST", intervalSec: 15, regions: ["us-west-2", "us-east-1"], status: "down", uptime30d: 97.12, avgLatencyMs: 4_810, lastCheckedAt: ago(0.004), alertChannels: ["#ops-alerts", "pager", "email"], thresholdMs: 500, expectedStatus: 202 },
  { id: "mon_5", name: "Docs — sitemap", url: "https://docs.orbit.dev/sitemap.xml", method: "GET", intervalSec: 300, regions: ["global"], status: "up", uptime30d: 100, avgLatencyMs: 64, lastCheckedAt: ago(0.05), alertChannels: ["email"], thresholdMs: 2000, expectedStatus: 200 },
  { id: "mon_6", name: "Mobile gateway — /ping", url: "https://m.orbit.dev/ping", method: "GET", intervalSec: 30, regions: ["ap-southeast-1", "ap-northeast-1"], status: "up", uptime30d: 99.95, avgLatencyMs: 98, lastCheckedAt: ago(0.008), alertChannels: ["#mobile"], thresholdMs: 600, expectedStatus: 200 },
  { id: "mon_7", name: "Legacy cron — status page", url: "https://cron.orbit.dev/status", method: "GET", intervalSec: 600, regions: ["us-east-1"], status: "paused", uptime30d: 0, avgLatencyMs: 0, lastCheckedAt: daysAgo(140), alertChannels: [], thresholdMs: 3000, expectedStatus: 200 },
];

export const incidents: Incident[] = [
  {
    id: "inc_204",
    title: "Ingest pipeline returning 5xx for all regions",
    severity: "critical",
    status: "open",
    service: "ingest-pipeline",
    startedAt: ago(0.35),
    resolvedAt: null,
    assignee: "Priya Nair",
    updates: [
      { ts: ago(0.35), author: "Orbit Monitor", text: "Monitor \"Ingest — accept endpoint\" failed in us-west-2 and us-east-1 (HTTP 503)." },
      { ts: ago(0.3), author: "Priya Nair", text: "Acknowledged. Correlates with deployment dpl_5c9x2p (kafka client bump). Investigating consumer group rebalance." },
      { ts: ago(0.1), author: "Priya Nair", text: "Rolling back to dpl_6u1f0y. ETA 5 min." },
    ],
  },
  {
    id: "inc_203",
    title: "Billing worker latency above 1s (p95)",
    severity: "high",
    status: "acknowledged",
    service: "billing-worker",
    startedAt: ago(2),
    resolvedAt: null,
    assignee: "Tomás Reyes",
    updates: [
      { ts: ago(2), author: "Orbit Monitor", text: "Latency threshold exceeded: 1,180ms > 1,000ms for 5 consecutive checks." },
      { ts: ago(1.8), author: "Tomás Reyes", text: "Slow query on invoices table — missing index on (org_id, created_at). Preparing migration." },
    ],
  },
  {
    id: "inc_202",
    title: "Elevated 429s from rate limiter for enterprise orgs",
    severity: "medium",
    status: "resolved",
    service: "atlas-api",
    startedAt: daysAgo(1.3),
    resolvedAt: daysAgo(1.2),
    assignee: "Tomás Reyes",
    updates: [
      { ts: daysAgo(1.3), author: "Jordan Ellis", text: "Customers on enterprise report unexpected 429s. Limits appear to fall back to free tier." },
      { ts: daysAgo(1.25), author: "Tomás Reyes", text: "Root cause: org lookup returned null for orgs with SSO-only members. Fix in aa01b2c." },
      { ts: daysAgo(1.2), author: "Tomás Reyes", text: "Deployed dpl_7v2g1x. 429 rate back to baseline. Resolving." },
    ],
  },
  {
    id: "inc_201",
    title: "Certificate renewal failed for ingest.orbit.dev",
    severity: "low",
    status: "resolved",
    service: "ingest-pipeline",
    startedAt: daysAgo(9),
    resolvedAt: daysAgo(8.8),
    assignee: "Sam Okafor",
    updates: [
      { ts: daysAgo(9), author: "Orbit", text: "ACME challenge failed: DNS record _acme-challenge.ingest not found." },
      { ts: daysAgo(8.8), author: "Sam Okafor", text: "CNAME restored at registrar. Renewal succeeded." },
    ],
  },
  {
    id: "inc_200",
    title: "Preview deployments stuck in queue",
    severity: "medium",
    status: "resolved",
    service: "atlas-web",
    startedAt: daysAgo(16),
    resolvedAt: daysAgo(15.7),
    assignee: null,
    updates: [{ ts: daysAgo(15.7), author: "Orbit", text: "Build queue capacity restored." }],
  },
];

export const apiKeys: ApiKey[] = [
  { id: "key_1", name: "CI — GitHub Actions", prefix: "orb_live_4kQ2", scopes: ["deployments:write", "projects:read"], createdAt: daysAgo(120), lastUsedAt: ago(1.5), expiresAt: null, createdBy: "Sam Okafor" },
  { id: "key_2", name: "Terraform provider", prefix: "orb_live_9mX7", scopes: ["projects:write", "env:write", "domains:write"], createdAt: daysAgo(88), lastUsedAt: daysAgo(2), expiresAt: daysAgo(-277), createdBy: "Sam Okafor" },
  { id: "key_3", name: "Datadog integration", prefix: "orb_live_2pL5", scopes: ["logs:read", "metrics:read"], createdAt: daysAgo(60), lastUsedAt: ago(0.02), expiresAt: null, createdBy: "Priya Nair" },
  { id: "key_4", name: "Local dev (Maya)", prefix: "orb_test_7cB1", scopes: ["*"], createdAt: daysAgo(14), lastUsedAt: ago(30), expiresAt: daysAgo(-16), createdBy: "Maya Chen" },
  { id: "key_5", name: "Old Jenkins", prefix: "orb_live_0aZ3", scopes: ["deployments:write"], createdAt: daysAgo(400), lastUsedAt: daysAgo(210), expiresAt: daysAgo(35), createdBy: "Jordan Ellis" },
];

export const webhooks: Webhook[] = [
  {
    id: "wh_1",
    url: "https://hooks.slack.com/services/T0/B0/xxxx",
    description: "Slack #deploys channel",
    events: ["deployment.ready", "deployment.error"],
    active: true,
    secretPrefix: "whsec_a1b2",
    createdAt: daysAgo(200),
    deliveries: [
      { id: "dlv_1", ts: ago(1.5), event: "deployment.ready", status: 200, durationMs: 143 },
      { id: "dlv_2", ts: ago(0.4), event: "deployment.error", status: 200, durationMs: 121 },
      { ts: ago(4), id: "dlv_3", event: "deployment.ready", status: 200, durationMs: 156 },
    ],
  },
  {
    id: "wh_2",
    url: "https://api.pagerduty.com/v2/enqueue",
    description: "PagerDuty — critical incidents",
    events: ["incident.opened", "incident.resolved", "monitor.down"],
    active: true,
    secretPrefix: "whsec_c3d4",
    createdAt: daysAgo(150),
    deliveries: [
      { id: "dlv_4", ts: ago(0.35), event: "incident.opened", status: 202, durationMs: 388 },
      { id: "dlv_5", ts: ago(0.35), event: "monitor.down", status: 202, durationMs: 402 },
    ],
  },
  {
    id: "wh_3",
    url: "https://internal.example.com/orbit/events",
    description: "Data warehouse sync",
    events: ["deployment.ready", "flag.updated", "member.added", "member.removed"],
    active: false,
    secretPrefix: "whsec_e5f6",
    createdAt: daysAgo(30),
    deliveries: [
      { id: "dlv_6", ts: daysAgo(1), event: "flag.updated", status: 503, durationMs: 30_000 },
      { id: "dlv_7", ts: daysAgo(1), event: "flag.updated", status: 503, durationMs: 30_000 },
      { id: "dlv_8", ts: daysAgo(1.1), event: "flag.updated", status: 503, durationMs: 30_000 },
    ],
  },
];

export const members: Member[] = [
  { id: "usr_1", name: "Sam Okafor", email: "sam@orbit.dev", role: "owner", joinedAt: daysAgo(900), lastActiveAt: ago(0.1), twoFactor: true, status: "active" },
  { id: "usr_2", name: "Maya Chen", email: "maya@orbit.dev", role: "admin", joinedAt: daysAgo(700), lastActiveAt: ago(0.5), twoFactor: true, status: "active" },
  { id: "usr_3", name: "Tomás Reyes", email: "tomas@orbit.dev", role: "developer", joinedAt: daysAgo(420), lastActiveAt: ago(0.3), twoFactor: true, status: "active" },
  { id: "usr_4", name: "Priya Nair", email: "priya@orbit.dev", role: "developer", joinedAt: daysAgo(300), lastActiveAt: ago(0.05), twoFactor: false, status: "active" },
  { id: "usr_5", name: "Jordan Ellis", email: "jordan@orbit.dev", role: "developer", joinedAt: daysAgo(180), lastActiveAt: daysAgo(1), twoFactor: true, status: "active" },
  { id: "usr_6", name: "Lena Fischer", email: "lena@partner.example.com", role: "viewer", joinedAt: daysAgo(20), lastActiveAt: daysAgo(3), twoFactor: false, status: "active" },
  { id: "usr_7", name: "Ravi Patel", email: "ravi@orbit.dev", role: "developer", joinedAt: daysAgo(2), lastActiveAt: daysAgo(2), twoFactor: false, status: "invited" },
  { id: "usr_8", name: "Chris Dubois", email: "chris@contractor.example.com", role: "viewer", joinedAt: daysAgo(400), lastActiveAt: daysAgo(95), twoFactor: false, status: "suspended" },
];

export const auditEvents: AuditEvent[] = [
  { id: "aud_1", ts: ago(0.1), actor: "Priya Nair", action: "deployment.rollback", target: "ingest-pipeline", ip: "203.0.113.42", details: "Rolled back to dpl_6u1f0y" },
  { id: "aud_2", ts: ago(0.4), actor: "Tomás Reyes", action: "deployment.create", target: "billing-worker", ip: "198.51.100.7", details: "Triggered production deploy from main (b17e04c)" },
  { id: "aud_3", ts: ago(1), actor: "Sam Okafor", action: "api_key.create", target: "Datadog integration", ip: "203.0.113.9", details: "Scopes: logs:read, metrics:read" },
  { id: "aud_4", ts: ago(3), actor: "Maya Chen", action: "flag.update", target: "new-dashboard", ip: "192.0.2.15", details: "Rollout 10% → 25%" },
  { id: "aud_5", ts: ago(6), actor: "Sam Okafor", action: "member.invite", target: "ravi@orbit.dev", ip: "203.0.113.9", details: "Role: developer" },
  { id: "aud_6", ts: daysAgo(1), actor: "Jordan Ellis", action: "env.update", target: "atlas-api / STRIPE_SECRET_KEY", ip: "192.0.2.77", details: "Value rotated (production)" },
  { id: "aud_7", ts: daysAgo(1.2), actor: "Tomás Reyes", action: "incident.resolve", target: "inc_202", ip: "198.51.100.7", details: "Resolved after deploy dpl_7v2g1x" },
  { id: "aud_8", ts: daysAgo(2), actor: "Priya Nair", action: "monitor.create", target: "Ingest — accept endpoint", ip: "203.0.113.42", details: "Interval 15s, 2 regions" },
  { id: "aud_9", ts: daysAgo(2.5), actor: "Sam Okafor", action: "webhook.disable", target: "Data warehouse sync", ip: "203.0.113.9", details: "Disabled after 3 consecutive failures" },
  { id: "aud_10", ts: daysAgo(3), actor: "Maya Chen", action: "project.create", target: "sandbox-playground", ip: "192.0.2.15", details: "Framework: Next.js, region us-east-1" },
  { id: "aud_11", ts: daysAgo(4), actor: "Sam Okafor", action: "member.role_change", target: "lena@partner.example.com", ip: "203.0.113.9", details: "developer → viewer" },
  { id: "aud_12", ts: daysAgo(5), actor: "Jordan Ellis", action: "deployment.cancel", target: "mobile-gateway", ip: "192.0.2.77", details: "Canceled dpl_9x4i3v" },
  { id: "aud_13", ts: daysAgo(6), actor: "Sam Okafor", action: "billing.plan_change", target: "Organization", ip: "203.0.113.9", details: "Team → Business (annual)" },
  { id: "aud_14", ts: daysAgo(8), actor: "Sam Okafor", action: "domain.add", target: "atlas-web / atlas-app.com", ip: "203.0.113.9", details: "Awaiting DNS verification" },
  { id: "aud_15", ts: daysAgo(9), actor: "Sam Okafor", action: "member.suspend", target: "chris@contractor.example.com", ip: "203.0.113.9", details: "Contract ended" },
  { id: "aud_16", ts: daysAgo(12), actor: "Maya Chen", action: "settings.update", target: "Organization", ip: "192.0.2.15", details: "Enforce 2FA: off → on (grace period 14d)" },
];

export const requestSeries = Array.from({ length: 24 }, (_, i) => {
  const hour = new Date(NOW.getTime() - (23 - i) * 3600_000);
  const base = 180_000 + Math.round(60_000 * Math.sin((i / 24) * Math.PI * 2 - 1.2)) + (i % 3) * 4_000;
  return {
    time: `${String(hour.getUTCHours()).padStart(2, "0")}:00`,
    requests: base,
    errors: i >= 20 ? Math.round(base * 0.18) : Math.round(base * 0.0015) + (i % 4) * 30,
    p95: i >= 20 ? 2_400 + i * 90 : 160 + (i % 5) * 18,
  };
});

export const usageSeries = Array.from({ length: 30 }, (_, i) => {
  const day = new Date(NOW.getTime() - (29 - i) * 86_400_000);
  return {
    date: `${day.getUTCMonth() + 1}/${day.getUTCDate()}`,
    requests: 18 + (i % 7) * 1.4 + i * 0.35,
    bandwidth: 42 + (i % 5) * 6 + i * 0.8,
    buildMinutes: 120 + (i % 6) * 35 + (i % 2) * 20,
  };
});

export const currentUser = members[0];

export const org = {
  name: "Orbit Labs",
  slug: "orbit-labs",
  plan: "Business",
  billingEmail: "billing@orbit.dev",
  seats: { used: 7, total: 10 },
  renewsAt: daysAgo(-142),
};
