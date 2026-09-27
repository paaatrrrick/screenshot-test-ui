"use client";

import { useRouter } from "next/navigation";
import {
  Activity,
  Flag,
  FolderKanban,
  KeyRound,
  Moon,
  Plus,
  Rocket,
  ScrollText,
  Settings,
  ShieldAlert,
  Users,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useStore } from "@/lib/store";

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { state } = useStore();

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} className="sm:max-w-xl">
      <CommandInput placeholder="Search projects, deployments, flags, or run a command…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => go("/monitors/new")}>
            <Plus /> Create monitor
          </CommandItem>
          <CommandItem onSelect={() => go("/flags?new=1")}>
            <Plus /> Create feature flag
          </CommandItem>
          <CommandItem onSelect={() => go("/api-keys?new=1")}>
            <Plus /> Create API key
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setTheme(theme === "dark" ? "light" : "dark");
              onOpenChange(false);
            }}
          >
            <Moon /> Toggle dark mode
            <CommandShortcut>⌘⇧D</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Projects">
          {state.projects.map((p) => (
            <CommandItem key={p.slug} value={`project ${p.name} ${p.slug}`} onSelect={() => go(`/projects/${p.slug}`)}>
              <FolderKanban /> {p.name}
              <span className="ml-auto text-xs text-muted-foreground">{p.framework}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Feature flags">
          {state.flags.map((f) => (
            <CommandItem key={f.id} value={`flag ${f.name} ${f.key}`} onSelect={() => go(`/flags?focus=${f.key}`)}>
              <Flag /> {f.name}
              <span className="ml-auto font-mono text-xs text-muted-foreground">{f.key}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Pages">
          <CommandItem onSelect={() => go("/deployments")}>
            <Rocket /> Deployments
          </CommandItem>
          <CommandItem onSelect={() => go("/logs")}>
            <ScrollText /> Logs
          </CommandItem>
          <CommandItem onSelect={() => go("/monitors")}>
            <Activity /> Monitors
          </CommandItem>
          <CommandItem onSelect={() => go("/incidents")}>
            <ShieldAlert /> Incidents
          </CommandItem>
          <CommandItem onSelect={() => go("/team")}>
            <Users /> Team
          </CommandItem>
          <CommandItem onSelect={() => go("/api-keys")}>
            <KeyRound /> API keys
          </CommandItem>
          <CommandItem onSelect={() => go("/settings")}>
            <Settings /> Settings
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
