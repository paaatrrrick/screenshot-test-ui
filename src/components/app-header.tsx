"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommandPalette } from "@/components/command-palette";
import { useStore } from "@/lib/store";
import { relativeTime } from "@/lib/format";

const labels: Record<string, string> = {
  projects: "Projects",
  deployments: "Deployments",
  logs: "Logs",
  flags: "Feature flags",
  monitors: "Monitors",
  incidents: "Incidents",
  usage: "Usage",
  team: "Team",
  "api-keys": "API keys",
  webhooks: "Webhooks",
  "audit-log": "Audit log",
  settings: "Settings",
  new: "New",
};

export function AppHeader() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { state } = useStore();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((seg, i) => ({
    href: "/" + segments.slice(0, i + 1).join("/"),
    label: labels[seg] ?? seg,
    last: i === segments.length - 1,
  }));
  const openIncidents = state.incidents.filter((i) => i.status !== "resolved");

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            {crumbs.length === 0 ? (
              <BreadcrumbPage>Overview</BreadcrumbPage>
            ) : (
              <BreadcrumbLink render={<Link href="/" />}>Overview</BreadcrumbLink>
            )}
          </BreadcrumbItem>
          {crumbs.map((c) => (
            <React.Fragment key={c.href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {c.last ? (
                  <BreadcrumbPage className="max-w-[240px] truncate">{c.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={c.href} />}>{c.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="hidden w-64 justify-start gap-2 text-muted-foreground sm:flex"
          onClick={() => setOpen(true)}
          data-testid="command-palette-trigger"
        >
          <Search className="size-3.5" />
          <span className="flex-1 text-left">Search or jump to…</span>
          <kbd className="pointer-events-none rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">⌘K</kbd>
        </Button>
        <Button variant="ghost" size="icon-sm" className="sm:hidden" onClick={() => setOpen(true)} aria-label="Search">
          <Search />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon-sm" aria-label="Notifications" className="relative" />}
          >
            <Bell />
            {openIncidents.length > 0 && (
              <span className="absolute top-1 right-1 size-2 rounded-full bg-destructive" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {openIncidents.map((i) => (
              <DropdownMenuItem key={i.id} render={<Link href={`/incidents?focus=${i.id}`} />} className="flex-col items-start gap-0.5">
                <span className="font-medium">{i.title}</span>
                <span className="text-xs text-muted-foreground">
                  {i.severity} · {i.service} · {relativeTime(i.startedAt)}
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem className="flex-col items-start gap-0.5">
              <span className="font-medium">Deployment failed: billing-worker</span>
              <span className="text-xs text-muted-foreground">dpl_7d3m0q · 24m ago</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex-col items-start gap-0.5">
              <span className="font-medium">Ravi Patel accepted your invite</span>
              <span className="text-xs text-muted-foreground">2d ago</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Toggle theme"
          data-testid="theme-toggle"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="hidden dark:block" />
          <Moon className="dark:hidden" />
        </Button>
      </div>
      <CommandPalette open={open} onOpenChange={setOpen} />
    </header>
  );
}
