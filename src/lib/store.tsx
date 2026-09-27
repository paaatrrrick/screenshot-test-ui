"use client";

import * as React from "react";
import {
  apiKeys as seedKeys,
  envVars as seedEnv,
  flags as seedFlags,
  members as seedMembers,
  monitors as seedMonitors,
  projects as seedProjects,
  webhooks as seedWebhooks,
  incidents as seedIncidents,
  type ApiKey,
  type EnvVar,
  type FeatureFlag,
  type Member,
  type Monitor,
  type Project,
  type Webhook,
  type Incident,
} from "./data";

interface State {
  projects: Project[];
  flags: FeatureFlag[];
  monitors: Monitor[];
  apiKeys: ApiKey[];
  webhooks: Webhook[];
  members: Member[];
  envVars: EnvVar[];
  incidents: Incident[];
}

type Action =
  | { type: "flag.toggle"; id: string }
  | { type: "flag.env"; id: string; env: keyof FeatureFlag["environments"]; value: boolean }
  | { type: "flag.create"; flag: FeatureFlag }
  | { type: "flag.delete"; id: string }
  | { type: "monitor.create"; monitor: Monitor }
  | { type: "monitor.toggle"; id: string }
  | { type: "monitor.delete"; id: string }
  | { type: "key.create"; key: ApiKey }
  | { type: "key.revoke"; id: string }
  | { type: "webhook.create"; webhook: Webhook }
  | { type: "webhook.toggle"; id: string }
  | { type: "webhook.delete"; id: string }
  | { type: "member.invite"; member: Member }
  | { type: "member.role"; id: string; role: Member["role"] }
  | { type: "member.remove"; id: string }
  | { type: "env.upsert"; envVar: EnvVar }
  | { type: "env.delete"; id: string }
  | { type: "project.delete"; slug: string }
  | { type: "project.pause"; slug: string }
  | { type: "incident.status"; id: string; status: Incident["status"] }
  | { type: "reset" };

const initial: State = {
  projects: seedProjects,
  flags: seedFlags,
  monitors: seedMonitors,
  apiKeys: seedKeys,
  webhooks: seedWebhooks,
  members: seedMembers,
  envVars: seedEnv,
  incidents: seedIncidents,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "flag.toggle":
      return { ...state, flags: state.flags.map((f) => (f.id === action.id ? { ...f, enabled: !f.enabled } : f)) };
    case "flag.env":
      return {
        ...state,
        flags: state.flags.map((f) =>
          f.id === action.id ? { ...f, environments: { ...f.environments, [action.env]: action.value } } : f,
        ),
      };
    case "flag.create":
      return { ...state, flags: [action.flag, ...state.flags] };
    case "flag.delete":
      return { ...state, flags: state.flags.filter((f) => f.id !== action.id) };
    case "monitor.create":
      return { ...state, monitors: [action.monitor, ...state.monitors] };
    case "monitor.toggle":
      return {
        ...state,
        monitors: state.monitors.map((m) =>
          m.id === action.id ? { ...m, status: m.status === "paused" ? "up" : "paused" } : m,
        ),
      };
    case "monitor.delete":
      return { ...state, monitors: state.monitors.filter((m) => m.id !== action.id) };
    case "key.create":
      return { ...state, apiKeys: [action.key, ...state.apiKeys] };
    case "key.revoke":
      return { ...state, apiKeys: state.apiKeys.filter((k) => k.id !== action.id) };
    case "webhook.create":
      return { ...state, webhooks: [action.webhook, ...state.webhooks] };
    case "webhook.toggle":
      return { ...state, webhooks: state.webhooks.map((w) => (w.id === action.id ? { ...w, active: !w.active } : w)) };
    case "webhook.delete":
      return { ...state, webhooks: state.webhooks.filter((w) => w.id !== action.id) };
    case "member.invite":
      return { ...state, members: [...state.members, action.member] };
    case "member.role":
      return { ...state, members: state.members.map((m) => (m.id === action.id ? { ...m, role: action.role } : m)) };
    case "member.remove":
      return { ...state, members: state.members.filter((m) => m.id !== action.id) };
    case "env.upsert": {
      const exists = state.envVars.some((e) => e.id === action.envVar.id);
      return {
        ...state,
        envVars: exists
          ? state.envVars.map((e) => (e.id === action.envVar.id ? action.envVar : e))
          : [action.envVar, ...state.envVars],
      };
    }
    case "env.delete":
      return { ...state, envVars: state.envVars.filter((e) => e.id !== action.id) };
    case "project.delete":
      return { ...state, projects: state.projects.filter((p) => p.slug !== action.slug) };
    case "project.pause":
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.slug === action.slug ? { ...p, status: p.status === "paused" ? "healthy" : "paused" } : p,
        ),
      };
    case "incident.status":
      return {
        ...state,
        incidents: state.incidents.map((i) => (i.id === action.id ? { ...i, status: action.status } : i)),
      };
    case "reset":
      return initial;
  }
}

const StoreContext = React.createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, initial);
  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = React.useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

let counter = 100;
export function nextId(prefix: string) {
  counter += 1;
  return `${prefix}_${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
