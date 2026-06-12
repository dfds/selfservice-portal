import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  Search,
  Users as UsersIcon,
  Bot,
  User as UserIcon,
  X,
} from "lucide-react";
import { AdminPageHeader } from "@/components/ui/AdminPageHeader";
import { TabGroup } from "@/components/ui/TabGroup";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useMutationToast } from "@/hooks/useMutationToast";
import { EntityPicker } from "@/components/rbac";
import {
  ServicePrincipalSearchCombobox,
  type GraphServicePrincipal,
} from "@/components/ServicePrincipalSearchCombobox";
import {
  useRbacGroups,
  useCreateRbacGroup,
  useRegisterServicePrincipal,
  type MemberSummary,
} from "@/state/remote/queries/rbac";
import { EntityInspector } from "./EntityInspector";
import { GroupInspector } from "./GroupInspector";

type ManageTab = "user" | "sp" | "group";

const TABS: { id: ManageTab; label: string; icon: React.ReactNode }[] = [
  {
    id: "user",
    label: "Users",
    icon: <UserIcon size={14} strokeWidth={1.75} />,
  },
  {
    id: "sp",
    label: "Service accounts",
    icon: <Bot size={14} strokeWidth={1.75} />,
  },
  {
    id: "group",
    label: "Groups",
    icon: <UsersIcon size={14} strokeWidth={1.75} />,
  },
];

function normaliseTab(value: string | null): ManageTab {
  if (value === "sp" || value === "group") return value;
  return "user";
}

export default function RbacManagePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = normaliseTab(searchParams.get("tab"));
  const selectedId = searchParams.get("id") ?? "";
  const isMobile = useIsMobile(900);

  // Track last-selected MemberSummary so the inspector can show display info
  // even before the per-member fetch resolves.
  const [selectedMember, setSelectedMember] = useState<MemberSummary | null>(
    null,
  );
  useEffect(() => {
    if (!selectedId || tab === "group") setSelectedMember(null);
  }, [selectedId, tab]);

  function setTab(next: ManageTab) {
    const params = new URLSearchParams(searchParams);
    params.set("tab", next);
    params.delete("id");
    setSearchParams(params, { replace: true });
  }

  function setSelected(id: string, member?: MemberSummary) {
    const params = new URLSearchParams(searchParams);
    if (id) params.set("id", id);
    else params.delete("id");
    setSearchParams(params, { replace: true });
    if (member) setSelectedMember(member);
  }

  return (
    <div className="px-5 md:px-8 py-6">
      <AdminPageHeader
        title="RBAC Management"
        subtitle="Manage permissions, roles, and group memberships for users, service accounts, and groups."
      />

      <div className="mb-5">
        <TabGroup<ManageTab>
          tabs={TABS}
          value={tab}
          onChange={(next) => setTab(next)}
        />
      </div>

      <div
        className={
          isMobile
            ? "flex flex-col gap-4"
            : "grid gap-5 [grid-template-columns:360px_1fr]"
        }
      >
        <aside
          className={isMobile && selectedId ? "hidden" : "flex flex-col gap-3"}
        >
          <LeftPane tab={tab} selectedId={selectedId} onSelect={setSelected} />
        </aside>

        <section className={isMobile && !selectedId ? "hidden" : ""}>
          {isMobile && selectedId && (
            <button
              type="button"
              onClick={() => setSelected("")}
              className="flex items-center gap-1.5 mb-3 text-xs font-mono text-muted hover:text-action transition-colors cursor-pointer border-0 bg-transparent"
            >
              <X size={12} strokeWidth={1.75} /> Back
            </button>
          )}
          <RightPane
            tab={tab}
            selectedId={selectedId}
            selectedMember={selectedMember}
            onClearOnDelete={() => setSelected("")}
          />
        </section>
      </div>
    </div>
  );
}

// ── Left pane ─────────────────────────────────────────────────────────────────

function LeftPane({
  tab,
  selectedId,
  onSelect,
}: {
  tab: ManageTab;
  selectedId: string;
  onSelect: (id: string, member?: MemberSummary) => void;
}) {
  if (tab === "group") {
    return (
      <GroupList selectedId={selectedId} onSelect={(id) => onSelect(id)} />
    );
  }
  if (tab === "sp") {
    return <ServiceAccountList onSelect={onSelect} />;
  }
  return (
    <div className="flex flex-col gap-2">
      <EntityPicker
        typeFilter="User"
        onSelect={(m) => onSelect(m.id, m)}
        placeholder="Search users by name or email…"
      />
      <p className="text-[0.625rem] text-muted font-mono">
        Start typing to find a user.
      </p>
    </div>
  );
}

function ServiceAccountList({
  onSelect,
}: {
  onSelect: (id: string, member?: MemberSummary) => void;
}) {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1.5">
        <div className="flex-1">
          <EntityPicker
            typeFilter="ServicePrincipal"
            onSelect={(m) => onSelect(m.id, m)}
            placeholder="Search service accounts…"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowRegister(true)}
          className="h-9 px-2 text-xs gap-1 shrink-0"
        >
          <Plus size={13} strokeWidth={1.75} /> New
        </Button>
      </div>
      <p className="text-[0.625rem] text-muted font-mono">
        Start typing to find a service account, or register one from Azure AD.
      </p>

      <RegisterServicePrincipalDialog
        open={showRegister}
        onClose={() => setShowRegister(false)}
        onRegistered={(member) => {
          setShowRegister(false);
          onSelect(member.id, member);
        }}
      />
    </div>
  );
}

function RegisterServicePrincipalDialog({
  open,
  onClose,
  onRegistered,
}: {
  open: boolean;
  onClose: () => void;
  onRegistered: (member: MemberSummary) => void;
}) {
  const [selected, setSelected] = useState<GraphServicePrincipal | null>(null);
  const registerMutation = useRegisterServicePrincipal();
  const fireRegister = useMutationToast(registerMutation, {
    invalidateKeys: [["rbac", "members"]],
    successMessage: (_data: any, vars: any) =>
      `Registered ${vars?.displayName || vars?.id}`,
    errorMessage: "Could not register service account",
    onSuccess: (member: any) => {
      setSelected(null);
      onRegistered(member as MemberSummary);
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setSelected(null);
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Register service account</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <p className="text-sm text-secondary">
            Search Azure AD for the service principal you want to manage in
            RBAC. The oid shown next to each result is the only durable
            identifier — make sure you pick the right one.
          </p>
          <ServicePrincipalSearchCombobox
            onSelect={(sp) => setSelected(sp)}
            submitLabel="Pick"
          />
          {selected && (
            <div className="rounded-[8px] border border-card bg-surface-muted px-3 py-2">
              <div className="text-sm font-medium text-primary">
                {selected.displayName}
              </div>
              <div className="font-mono text-xs text-muted">
                oid: {selected.id}
              </div>
              {selected.appId && selected.appId !== selected.id && (
                <div className="font-mono text-[0.6875rem] text-muted">
                  appId: {selected.appId}
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={registerMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="action"
              disabled={!selected || registerMutation.isPending}
              onClick={() =>
                selected &&
                fireRegister({
                  id: selected.id,
                  displayName: selected.displayName,
                })
              }
            >
              {registerMutation.isPending ? "Registering…" : "Register"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function GroupList({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const { data, isFetched } = useRbacGroups();
  const groups: any[] = (data as any[]) ?? [];

  const [filter, setFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");

  const createMutation = useCreateRbacGroup();
  const fireCreate = useMutationToast(createMutation, {
    invalidateKeys: [["rbac", "groups"]],
    successMessage: "Group created",
    errorMessage: "Could not create group",
    onSuccess: (data: any) => {
      setShowCreate(false);
      setNewName("");
      if (data?.id) onSelect(data.id);
    },
  });

  const filtered = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    const list = needle
      ? groups.filter((g: any) => (g.name ?? "").toLowerCase().includes(needle))
      : groups;
    return [...list].sort((a: any, b: any) =>
      (a.name ?? a.id).localeCompare(b.name ?? b.id),
    );
  }, [groups, filter]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1.5">
        <div className="relative flex-1">
          <Search
            size={14}
            strokeWidth={1.75}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            aria-hidden="true"
          />
          <Input
            placeholder="Filter groups…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm font-mono pl-8"
            autoComplete="off"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCreate(true)}
          className="h-9 px-2 text-xs gap-1 shrink-0"
        >
          <Plus size={13} strokeWidth={1.75} /> New
        </Button>
      </div>

      {!isFetched ? (
        <div className="space-y-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-[5px]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState>
          {filter ? "No groups match." : "No groups yet."}
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto pr-1">
          {filtered.map((g: any) => {
            const isActive = g.id === selectedId;
            const count = (g.members ?? []).length;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => onSelect(g.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded-[5px] cursor-pointer border transition-colors ${
                  isActive
                    ? "border-action bg-surface-muted"
                    : "border-card bg-surface hover:bg-surface-muted"
                }`}
              >
                <UsersIcon
                  size={13}
                  strokeWidth={1.75}
                  className="text-muted shrink-0"
                />
                <span className="text-sm font-medium text-primary flex-1 truncate">
                  {g.name ?? g.id}
                </span>
                <span className="text-[0.625rem] text-muted font-mono shrink-0">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create group</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newName.trim()) return;
              fireCreate({ name: newName.trim() });
            }}
            className="space-y-4 mt-2"
          >
            <div>
              <SectionLabel className="block mb-1.5">Name</SectionLabel>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. platform-admins"
                className="text-sm font-mono"
                autoFocus
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreate(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="action"
                disabled={!newName.trim() || createMutation.isPending}
              >
                {createMutation.isPending ? "Creating…" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Right pane ────────────────────────────────────────────────────────────────

function RightPane({
  tab,
  selectedId,
  selectedMember,
  onClearOnDelete,
}: {
  tab: ManageTab;
  selectedId: string;
  selectedMember: MemberSummary | null;
  onClearOnDelete: () => void;
}) {
  if (!selectedId) {
    return (
      <div className="border border-card rounded-[8px] bg-surface p-10 flex flex-col items-center text-center gap-2">
        <Search size={28} strokeWidth={1.5} className="text-muted" />
        <EmptyState>
          {tab === "group"
            ? "Select a group from the list to view its members and grants."
            : tab === "sp"
            ? "Search for a service account to inspect its permissions."
            : "Search for a user to inspect their permissions."}
        </EmptyState>
      </div>
    );
  }

  if (tab === "group") {
    return <GroupInspector groupId={selectedId} onDeleted={onClearOnDelete} />;
  }

  return (
    <EntityInspector
      memberId={selectedId}
      initialMember={selectedMember ?? undefined}
    />
  );
}
