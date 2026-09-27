import { NOW } from "./data";

export function relativeTime(iso: string, from: Date = NOW) {
  const diff = from.getTime() - new Date(iso).getTime();
  const abs = Math.abs(diff);
  const future = diff < 0;
  const s = Math.round(abs / 1000);
  const m = Math.round(s / 60);
  const h = Math.round(m / 60);
  const d = Math.round(h / 24);
  let out: string;
  if (s < 45) out = "just now";
  else if (m < 60) out = `${m}m`;
  else if (h < 24) out = `${h}h`;
  else if (d < 30) out = `${d}d`;
  else out = `${Math.round(d / 30)}mo`;
  if (out === "just now") return out;
  return future ? `in ${out}` : `${out} ago`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export function compactNumber(n: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export function formatDuration(sec: number | null) {
  if (sec === null) return "—";
  if (sec < 60) return `${sec}s`;
  return `${Math.floor(sec / 60)}m ${sec % 60}s`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function maskSecret(value: string) {
  return "•".repeat(Math.min(24, Math.max(8, value.length)));
}
