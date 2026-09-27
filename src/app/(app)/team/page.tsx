"use client";

import * as React from "react";
import { MoreHorizontal, Search, ShieldCheck, ShieldOff, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PageHeader, StatusBadge } from "@/components/shared";
import { NOW, org, type Role } from "@/lib/data";
import { nextId, useStore } from "@/lib/store";
import { formatDate, initials, relativeTime } from "@/lib/format";

const roles: { value: Role; label: string; description: string }[] = [
  { value: "owner", label: "Owner", description: "Full access, including billing and deleting the organization." },
  { value: "admin", label: "Admin", description: "Manage projects, members, and settings. Cannot access billing." },
  { value: "developer", label: "Developer", description: "Deploy, manage env vars and flags. Cannot manage members." },
  { value: "viewer", label: "Viewer", description: "Read-only access to projects, logs, and monitors." },
];

export default function TeamPage() {
  const { state, dispatch } = useStore();
  const [query, setQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [emails, setEmails] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState<Role>("developer");

  const members = state.members.filter(
    (m) => (roleFilter === "all" || m.role === roleFilter) && (query === "" || m.name.toLowerCase().includes(query.toLowerCase()) || m.email.includes(query.toLowerCase())),
  );

  return (
    <>
      <PageHeader
        title="Team"
        description={`${org.seats.used} of ${org.seats.total} seats used on the ${org.plan} plan.`}
        actions={
          <Button onClick={() => setInviteOpen(true)} data-testid="invite-member">
            <UserPlus data-icon="inline-start" /> Invite members
          </Button>
        }
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search members…" className="pl-8" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as string)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {roles.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="py-0">
        <Table data-testid="members-table">
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>2FA</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Last active</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="pl-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{initials(m.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 font-medium">
                        {m.name}
                        {m.id === "usr_1" && <Badge variant="outline">You</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground">{m.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Select value={m.role} onValueChange={(v) => { dispatch({ type: "member.role", id: m.id, role: v as Role }); toast(`${m.name} is now ${v}`); }} disabled={m.role === "owner"}>
                    <SelectTrigger size="sm" className="w-32 capitalize">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <StatusBadge status={m.status} dot={false} />
                </TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger render={<span className="inline-flex" />}>
                      {m.twoFactor ? <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" /> : <ShieldOff className="size-4 text-amber-600 dark:text-amber-400" />}
                    </TooltipTrigger>
                    <TooltipContent>{m.twoFactor ? "Two-factor enabled" : "Two-factor not enabled — grace period ends in 2 days"}</TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(m.joinedAt)}</TableCell>
                <TableCell className="text-right text-muted-foreground">{relativeTime(m.lastActiveAt)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Member actions" />}>
                      <MoreHorizontal />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {m.status === "invited" && <DropdownMenuItem onClick={() => toast("Invitation resent")}>Resend invite</DropdownMenuItem>}
                      <DropdownMenuItem onClick={() => toast("Password reset email sent")}>Reset password</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast("Sessions revoked")}>Sign out everywhere</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        disabled={m.role === "owner"}
                        onClick={() => {
                          dispatch({ type: "member.remove", id: m.id });
                          toast(`Removed ${m.name}`);
                        }}
                      >
                        Remove from organization
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-lg" data-testid="invite-dialog">
          <DialogHeader>
            <DialogTitle>Invite members</DialogTitle>
            <DialogDescription>Invitees receive an email and appear as pending until they accept.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emails">Email addresses</Label>
              <Textarea id="emails" rows={3} placeholder="alex@orbit.dev, sam@orbit.dev" value={emails} onChange={(e) => setEmails(e.target.value)} />
              <p className="text-xs text-muted-foreground">Separate multiple addresses with commas or new lines.</p>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <RadioGroup value={inviteRole} onValueChange={(v) => setInviteRole(v as Role)}>
                {roles
                  .filter((r) => r.value !== "owner")
                  .map((r) => (
                    <Label key={r.value} className="flex items-start gap-3 rounded-lg border p-3 font-normal has-data-checked:border-primary">
                      <RadioGroupItem value={r.value} className="mt-0.5" />
                      <span>
                        <span className="block font-medium">{r.label}</span>
                        <span className="block text-xs text-muted-foreground">{r.description}</span>
                      </span>
                    </Label>
                  ))}
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!emails.includes("@")}
              onClick={() => {
                const list = emails.split(/[\s,]+/).filter((e) => e.includes("@"));
                list.forEach((email) =>
                  dispatch({
                    type: "member.invite",
                    member: { id: nextId("usr"), name: email.split("@")[0], email, role: inviteRole, joinedAt: NOW.toISOString(), lastActiveAt: NOW.toISOString(), twoFactor: false, status: "invited" },
                  }),
                );
                toast.success(`Sent ${list.length} invitation${list.length === 1 ? "" : "s"}`);
                setInviteOpen(false);
                setEmails("");
              }}
            >
              Send invites
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
