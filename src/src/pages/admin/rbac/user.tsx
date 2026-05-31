import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import Select from "react-select";
import { useTheme } from "@/context/ThemeContext";
import { UserSearchCombobox } from "@/components/UserSearchCombobox";
import {
  useUserPermissions,
  useUserRbacRoles,
  useCanThey,
  useGetRoles,
  useAllPermissions,
} from "@/state/remote/queries/rbac";
import { useCapabilities } from "@/state/remote/queries/capabilities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminPageHeader } from "@/components/ui/AdminPageHeader";
import { groupPermsByNamespace } from "@/lib/rbacUtils";

// UserSearchCombobox imported from @/components/UserSearchCombobox

// ── Permission combobox ───────────────────────────────────────────────────────

function PermissionCombobox({
  value,
  onChange,
  allPerms,
  namespace,
}: {
  value: string;
  onChange: (v: string) => void;
  allPerms: any[];
  namespace: string;
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const pool = namespace
    ? allPerms.filter((p: any) => p.namespace === namespace)
    : allPerms;
  const filtered =
    value.trim().length === 0
      ? []
      : pool
          .filter((p: any) =>
            (p.name ?? "").toLowerCase().includes(value.toLowerCase()),
          )
          .slice(0, 10);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative flex-1">
      <Input
        placeholder="Permission name"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => value.length > 0 && setShowDropdown(true)}
        className="text-sm font-mono"
        autoComplete="off"
      />
      {showDropdown && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 border border-card rounded-[8px] bg-background shadow-card z-50 overflow-hidden max-h-52 overflow-y-auto">
          {filtered.map((p: any) => (
            <button
              key={`${p.namespace}-${p.name}`}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(p.name ?? p.id);
                setShowDropdown(false);
              }}
              className="w-full flex flex-col px-3 py-1.5 text-left hover:bg-surface-muted transition-colors cursor-pointer border-0 bg-transparent"
            >
              <span className="text-[10px] text-muted font-mono">
                {p.namespace}
              </span>
              <span className="text-xs font-mono text-primary">{p.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sections ──────────────────────────────────────────────────────────────────

function UserPermissionsSection({ userId }: { userId: string }) {
  const { data, isFetched } = useUserPermissions(userId);
  const items: any[] = (data as any[]) ?? [];

  if (!isFetched) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-32 rounded-full" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-xs text-muted font-mono">No direct permissions.</p>
    );
  }

  const grouped = groupPermsByNamespace(items, "permission");
  const namespaces = Object.keys(grouped).sort();

  return (
    <div className="space-y-2">
      {namespaces.map((ns) => (
        <div key={ns}>
          <SectionLabel className="block mb-1">{ns}</SectionLabel>
          <div className="flex flex-wrap gap-1">
            {grouped[ns].map((p, i) => (
              <Badge
                key={`${p}-${i}`}
                variant="outline"
                className="text-[10px] font-mono"
              >
                {p}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function UserRolesSection({ userId }: { userId: string }) {
  const { data, isFetched } = useUserRbacRoles(userId);
  const { data: allRolesData } = useGetRoles("");
  const { data: capsData } = useCapabilities();

  const items: any[] = (data as any[]) ?? [];
  const allRoles: any[] = (allRolesData as any[]) ?? [];
  const caps: any[] = (capsData as any[]) ?? [];

  const rolesMap: Record<string, any> = allRoles.reduce((acc, r: any) => {
    if (r.id) acc[r.id] = r;
    return acc;
  }, {});
  const capsMap: Record<string, string> = caps.reduce((acc, c: any) => {
    if (c.id) acc[c.id] = c.name;
    return acc;
  }, {});

  if (!isFetched) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-28 rounded-full" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <p className="text-xs text-muted font-mono">No roles assigned.</p>;
  }

  return (
    <div className="flex flex-col gap-1.5">
      {items.map((r: any, i: number) => {
        const roleId = r.roleId ?? r.id;
        const role = rolesMap[roleId];
        const roleName = role?.name ?? roleId;
        const resourceType = r.type ?? "";
        const resourceId = r.resource ?? "";
        const resolvedName =
          resourceType?.toLowerCase() === "capability"
            ? capsMap[resourceId] ?? resourceId
            : resourceId;

        return (
          <div
            key={`${roleId}-${i}`}
            className="flex items-center gap-1.5 flex-wrap"
          >
            <Badge variant="secondary" className="text-[10px] font-mono">
              {roleName}
            </Badge>
            {resourceId && (
              <span className="text-[10px] text-muted font-mono">
                {resourceType ? `${resourceType}: ` : ""}
                {resolvedName}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CanTheyTester({ userId }: { userId: string }) {
  const { data: allPermsData } = useAllPermissions();
  const { data: capsData } = useCapabilities();

  const allPerms: any[] = (allPermsData as any[]) ?? [];
  const caps: any[] = (capsData as any[]) ?? [];

  const { isDark } = useTheme();
  const canTheyMutation = useCanThey();
  const [namespace, setNamespace] = useState("");
  const [permission, setPermission] = useState("");
  const [resource, setResource] = useState("");
  const [result, setResult] = useState<boolean | null>(null);

  const namespaces: string[] = Array.from(
    new Set(allPerms.map((p: any) => p.namespace).filter(Boolean)),
  ).sort() as string[];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!permission.trim() || !namespace) return;
    setResult(null);
    canTheyMutation.mutate(
      {
        userId,
        permissions: [{ description: "", name: permission.trim(), namespace }],
        objectid: resource.trim() || "",
      },
      {
        onSuccess: (data: any) => {
          const permitted = Object.values(data?.permissionMatrix ?? {}).some(
            (v: any) => v?.permitted === true,
          );
          setResult(permitted);
        },
        onError: () => {
          setResult(false);
        },
      },
    );
  }

  return (
    <div className="border border-card rounded-[8px] p-4">
      <SectionLabel className="block mb-3">Can they?</SectionLabel>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <Select
          menuPortalTarget={document.body}
          menuPosition="fixed"
          placeholder="— namespace —"
          value={namespace ? { value: namespace, label: namespace } : null}
          onChange={(opt: any) => {
            setNamespace(opt?.value ?? "");
            setPermission("");
            setResult(null);
          }}
          options={namespaces.map((ns) => ({ value: ns, label: ns }))}
          styles={{
            control: (base: any) => ({
              ...base,
              minHeight: "36px",
              height: "36px",
              fontSize: "11px",
              fontFamily: "monospace",
              border: `1px solid ${isDark ? "#334155" : "#d9dcde"}`,
              boxShadow: "none",
              minWidth: "160px",
              backgroundColor: isDark ? "#0f172a" : "#ffffff",
            }),
            valueContainer: (base: any) => ({ ...base, padding: "0 8px" }),
            indicatorsContainer: (base: any) => ({ ...base, height: "36px" }),
            menu: (base: any) => ({
              ...base,
              fontSize: "11px",
              fontFamily: "monospace",
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              border: isDark ? "1px solid #334155" : undefined,
            }),
            menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
            singleValue: (base: any) => ({
              ...base,
              color: isDark ? "#e2e8f0" : "#002b45",
            }),
            placeholder: (base: any) => ({
              ...base,
              color: isDark ? "#64748b" : "#afafaf",
            }),
            input: (base: any) => ({
              ...base,
              fontSize: "16px",
              color: isDark ? "#e2e8f0" : "#002b45",
            }),
            option: (base: any, state: any) => ({
              ...base,
              backgroundColor: state.isSelected
                ? isDark
                  ? "#1d4ed8"
                  : "#0e7cc1"
                : state.isFocused
                ? isDark
                  ? "#0f172a"
                  : "#f2f2f2"
                : isDark
                ? "#1e293b"
                : "#ffffff",
              color: state.isSelected
                ? "#ffffff"
                : isDark
                ? "#e2e8f0"
                : "#002b45",
            }),
            indicatorSeparator: (base: any) => ({
              ...base,
              backgroundColor: isDark ? "#334155" : "#d9dcde",
            }),
            dropdownIndicator: (base: any) => ({
              ...base,
              color: isDark ? "#64748b" : "#afafaf",
            }),
          }}
        />
        <PermissionCombobox
          value={permission}
          onChange={(v) => {
            setPermission(v);
            setResult(null);
          }}
          allPerms={allPerms}
          namespace={namespace}
        />
        <div className="flex-1">
          <Input
            list="can-they-resources-list"
            placeholder="Resource (optional)"
            value={resource}
            onChange={(e) => setResource(e.target.value)}
            className="text-sm font-mono"
          />
          <datalist id="can-they-resources-list">
            {caps.map((c: any) => (
              <option key={c.id} value={c.id} label={c.name} />
            ))}
          </datalist>
        </div>
        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={
            !namespace || !permission.trim() || canTheyMutation.isPending
          }
          className="shrink-0"
        >
          {canTheyMutation.isPending ? "Checking…" : "Check"}
        </Button>
      </form>
      {result !== null && (
        <div className="mt-3">
          <Badge
            variant={result ? "soft-success" : "destructive"}
            className="text-xs"
          >
            {result ? "Allowed" : "Denied"}
          </Badge>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function UserInspectorPage() {
  const [searchedUserId, setSearchedUserId] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");

  function handleSelect(userId: string, label: string) {
    setSearchedUserId(userId);
    setSelectedLabel(label);
  }

  function handleClear() {
    setSearchedUserId("");
    setSelectedLabel("");
  }

  return (
    <div className="px-5 md:px-8 py-6">
      <AdminPageHeader
        title="User Inspector"
        subtitle="View effective permissions and roles for any user."
      />

      {/* Search */}
      <div className="mb-6">
        {searchedUserId ? (
          <div className="flex items-center gap-2 px-3 py-2 border border-input rounded-[6px] bg-background">
            <Search
              size={14}
              strokeWidth={1.75}
              className="text-muted flex-shrink-0"
            />
            <span className="text-sm font-mono flex-1 truncate">
              {selectedLabel}
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 rounded text-muted hover:text-primary transition-colors cursor-pointer border-0 bg-transparent"
              aria-label="Clear selection"
            >
              <X size={14} strokeWidth={1.75} />
            </button>
          </div>
        ) : (
          <UserSearchCombobox onSelect={handleSelect} submitLabel="Inspect" />
        )}
      </div>

      {searchedUserId && (
        <div className="space-y-4 animate-fade-up">
          {/* Permissions + Roles side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-card rounded-[8px] p-4">
              <SectionLabel className="block mb-3">
                Direct Permissions
              </SectionLabel>
              <UserPermissionsSection userId={searchedUserId} />
            </div>
            <div className="border border-card rounded-[8px] p-4">
              <SectionLabel className="block mb-3">Assigned Roles</SectionLabel>
              <UserRolesSection userId={searchedUserId} />
            </div>
          </div>

          {/* Can they tester */}
          <CanTheyTester userId={searchedUserId} />
        </div>
      )}

      {!searchedUserId && (
        <div className="flex flex-col items-center py-12 text-center gap-2">
          <Search size={32} strokeWidth={1.5} className="text-muted" />
          <EmptyState>
            Search for a user by name or email to inspect their permissions.
          </EmptyState>
        </div>
      )}
    </div>
  );
}
