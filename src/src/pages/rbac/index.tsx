import React, { useContext, useEffect, useRef, useState } from "react";
import { Check, Save } from "lucide-react";
import {
  usePermissionMatrix,
  useSetRolePermissions,
} from "@/state/remote/queries/rbac";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { InfoAlert } from "@/components/ui/InfoAlert";
import PreAppContext from "@/preAppContext";
import { useToast } from "@/context/ToastContext";

// Mirrors PermissionsQuery.FindGuestPermissions on the API, which resolves the role by
// lowercased name rather than by id.
const isGuestRole = (role: { name: string }) =>
  role.name.trim().toLowerCase() === "guest";

type RbacRoleDTO = {
  id: string;
  name: string;
  description?: string;
  type?: string;
};

type PermissionDto = {
  namespace: string;
  name: string;
  description?: string;
  accessType?: string;
};

type PermissionMatrixGrantDto = {
  roleId: string;
  namespace: string;
  permission: string;
};

type PermissionMatrixResponse = {
  roles: RbacRoleDTO[];
  permissions: PermissionDto[];
  grants: PermissionMatrixGrantDto[];
};

export default function PermissionMatrixPage() {
  const { data, isFetching, isFetched } = usePermissionMatrix();
  const { mutate: setRolePermissions } = useSetRolePermissions();
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const toast = useToast();

  const matrix = data as PermissionMatrixResponse | undefined;
  const roles: RbacRoleDTO[] = matrix?.roles ?? [];
  const permissions: PermissionDto[] = matrix?.permissions ?? [];
  const grants: PermissionMatrixGrantDto[] = matrix?.grants ?? [];

  // Local draft state: "roleId|ns|perm" → boolean
  const [localGrantSet, setLocalGrantSet] = useState<Record<string, boolean>>(
    {},
  );
  // Baseline that tracks what's persisted on the server (used for dirty-checking)
  const [savedGrantSet, setSavedGrantSet] = useState<Record<string, boolean>>(
    {},
  );
  // Which role is currently being saved
  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);

  // Initialise both states once when data first arrives
  useEffect(() => {
    if (!isFetched) return;
    const map: Record<string, boolean> = {};
    grants.forEach((g) => {
      map[`${g.roleId}|${g.namespace}|${g.permission}`] = true;
    });
    setLocalGrantSet(map);
    setSavedGrantSet(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetched]);

  // Original grant set for dirty checking
  const isDirty = (roleId: string) =>
    permissions.some((p) => {
      const key = `${roleId}|${p.namespace}|${p.name}`;
      return (localGrantSet[key] ?? false) !== (savedGrantSet[key] ?? false);
    });

  const handleToggle = (roleId: string, namespace: string, name: string) => {
    const key = `${roleId}|${namespace}|${name}`;
    setLocalGrantSet((prev: Record<string, boolean>) => ({
      ...prev,
      [key]: !(prev[key] ?? false),
    }));
  };

  const handleSave = (roleId: string) => {
    setSavingRoleId(roleId);
    const permsToSave = permissions
      .filter((p) => localGrantSet[`${roleId}|${p.namespace}|${p.name}`])
      .map((p) => ({ namespace: p.namespace, name: p.name }));
    setRolePermissions(
      { roleId, permissions: permsToSave },
      {
        onSuccess: () => {
          // Advance the saved baseline to match what was just persisted,
          // so dirty-checking is correct without needing a refetch.
          setSavedGrantSet((prev: Record<string, boolean>) => {
            const updated = { ...prev };
            permissions.forEach((p) => {
              const key = `${roleId}|${p.namespace}|${p.name}`;
              updated[key] = localGrantSet[key] ?? false;
            });
            return updated;
          });
          toast.success("Permissions saved.");
          setSavingRoleId(null);
        },
        onError: () => {
          toast.error("Failed to save permissions.");
          setSavingRoleId(null);
        },
      },
    );
  };

  const headScrollRef = useRef<HTMLDivElement>(null);
  const bodyScrollRef = useRef<HTMLDivElement>(null);
  const syncScrollLeft = (
    from: React.RefObject<HTMLDivElement>,
    to: React.RefObject<HTMLDivElement>,
  ) => {
    if (from.current && to.current) {
      to.current.scrollLeft = from.current.scrollLeft;
    }
  };

  // Header and body are separate tables, so both use table-fixed with these widths to keep
  // their columns aligned. Role widths are in ch of the header's mono font so the longest
  // name fits without wrapping; the Guest column adds room for the "everyone" badge.
  const colgroup = (
    <colgroup>
      <col className="w-[240px]" />
      {roles.map((role) => (
        <col
          key={role.id}
          className="font-mono text-[0.6875rem]"
          style={{
            width: `max(120px, calc(${role.name.length}ch + 24px${
              isGuestRole(role) ? " + 72px" : ""
            }))`,
          }}
        />
      ))}
    </colgroup>
  );

  // Group permissions by namespace
  const namespaces = Array.from(
    new Set(permissions.map((p) => p.namespace)),
  ).sort();

  const permissionsByNamespace: Record<string, PermissionDto[]> = {};
  for (const ns of namespaces) {
    permissionsByNamespace[ns] = permissions.filter((p) => p.namespace === ns);
  }

  return (
    <div className="px-5 md:px-8 py-6 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <div className="font-mono text-[0.6875rem] font-semibold tracking-[0.15em] uppercase text-[#0e7cc1] dark:text-[#60a5fa] mb-1">
          {"// RBAC"}
        </div>
        <h1 className="text-[1.6rem] font-bold text-[#002b45] dark:text-[#e2e8f0]">
          Permission Matrix
        </h1>
        <p className="mt-1 text-[0.8125rem] text-[#6b7280] dark:text-slate-400">
          An overview of which permissions are granted to each role in the
          system.
          {isCloudEngineerEnabled && (
            <span className="ml-1 text-amber-600 dark:text-amber-400">
              Toggle switches to edit, then save per column.
            </span>
          )}
        </p>
      </div>

      {roles.some(isGuestRole) && (
        <InfoAlert variant="warning" className="mb-5">
          <span className="block mb-1 font-mono text-[0.6875rem] font-semibold tracking-[0.1em] uppercase">
            Guest is the baseline role
          </span>
          Every permission ticked in the <strong>Guest</strong> column is
          granted to <strong>every authenticated user</strong> — on every
          capability and platform-wide — including users who already hold
          another role. Guest is a floor, not a fallback: other roles add to it,
          they never replace it. Never grant{" "}
          <code className="font-mono">rbac</code> or{" "}
          <code className="font-mono">system-admin</code> permissions here.
        </InfoAlert>
      )}

      {isFetching && !isFetched && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded" />
          ))}
        </div>
      )}

      {isFetched && roles.length === 0 && (
        <p className="text-[0.8125rem] text-muted font-mono">
          No permission matrix data available.
        </p>
      )}

      {isFetched && roles.length > 0 && (
        // The header is a separate table so it can stick to the page: an overflow-x-auto
        // ancestor would become its scroll container and stop it sticking to the window.
        // overflow-clip keeps the rounded corners without creating one; isolate keeps the
        // z-indices below inside the card, under the TopBar (sticky, z-10).
        <div className="isolate bg-white dark:bg-[#1e293b] border border-[#d9dcde] dark:border-[#334155] rounded-[8px] overflow-clip">
          <div
            ref={headScrollRef}
            onScroll={() => syncScrollLeft(headScrollRef, bodyScrollRef)}
            className="sticky top-[var(--topbar-height)] z-20 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-white dark:bg-[#1e293b] border-b border-[#eeeeee] dark:border-[#1e2d3d]"
          >
            <table className="w-full table-fixed border-collapse text-[0.75rem]">
              {colgroup}
              <thead>
                <tr>
                  {/* Divider is an inset shadow: with border-collapse the table paints
                      borders, so a border-r stays put when this sticky cell moves. */}
                  <th className="sticky left-0 z-10 bg-white dark:bg-[#1e293b] px-4 py-3 text-left font-mono text-[0.6875rem] text-[#afafaf] dark:text-slate-500 shadow-[inset_-1px_0_0_var(--color-border-divider)]">
                    Permission
                  </th>
                  {roles.map((role) => {
                    const dirty = isDirty(role.id);
                    const saving = savingRoleId === role.id;
                    return (
                      <th
                        key={role.id}
                        title={role.description ?? role.name}
                        className="px-3 py-2 text-center font-mono text-[0.6875rem] text-[#002b45] dark:text-[#e2e8f0] whitespace-nowrap"
                      >
                        <div className="flex flex-col items-center gap-1.5">
                          {/* The badge shares the name's line. It keeps its natural height so its
                              own text isn't squeezed, and -my-[1.5px] cancels the 3px that would
                              otherwise add to the row — every column keeps the same two-row header
                              and the Save buttons stay on one baseline. -translate-y-px is optical,
                              not geometric: the boxes centre exactly, but the name's cap-height
                              glyphs sit high while the badge's all-x-height text sits low, which
                              reads as the badge hanging. Transform, so layout is untouched. */}
                          <span className="flex items-center gap-1.5 leading-none">
                            {role.name}
                            {isGuestRole(role) && (
                              <span
                                title="Applies to every user, in addition to any other role they hold"
                                className="-my-[1.5px] inline-flex -translate-y-px items-center rounded-full border border-[#ed8800]/40 px-1.5 py-px font-mono text-[0.625rem] leading-none text-[#ed8800] normal-case"
                              >
                                everyone
                              </span>
                            )}
                          </span>
                          {isCloudEngineerEnabled && (
                            <Button
                              size="sm"
                              variant="action"
                              onClick={() => handleSave(role.id)}
                              disabled={!dirty || saving}
                              className="h-6 px-2 text-[0.625rem]"
                            >
                              <Save size={10} />
                              {saving ? "Saving…" : "Save"}
                            </Button>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
            </table>
          </div>
          <div
            ref={bodyScrollRef}
            onScroll={() => syncScrollLeft(bodyScrollRef, headScrollRef)}
            className="overflow-x-auto"
          >
            <table className="w-full table-fixed border-collapse text-[0.75rem]">
              {colgroup}
              <tbody>
                {namespaces.map((ns) => (
                  <React.Fragment key={ns}>
                    {/* Namespace header row */}
                    <tr className="bg-[#f8f9fa] dark:bg-[#0f172a]">
                      {/* The cell spans the full table width, so it can't stick; the label
                          sticks within it instead. */}
                      <td colSpan={roles.length + 1} className="px-4 py-1.5">
                        <SectionLabel className="sticky left-4 inline-block">
                          {ns}
                        </SectionLabel>
                      </td>
                    </tr>
                    {/* Permission rows */}
                    {permissionsByNamespace[ns].map((perm) => (
                      <tr
                        key={`${perm.namespace}|${perm.name}`}
                        className="border-t border-[#eeeeee] dark:border-[#1e2d3d] hover:bg-[#f8f9fa] dark:hover:bg-[#0f172a]/50"
                      >
                        <td className="sticky left-0 z-10 bg-white dark:bg-[#1e293b] hover:bg-[#f8f9fa] dark:hover:bg-[#0f172a]/50 px-4 py-2 shadow-[inset_-1px_0_0_var(--color-border-divider)]">
                          <span
                            className="font-mono text-[0.6875rem] text-[#002b45] dark:text-[#e2e8f0]"
                            title={perm.description}
                          >
                            {perm.name}
                          </span>
                          {perm.accessType && (
                            <span className="ml-2 inline-flex items-center rounded-full border border-[#d9dcde] dark:border-[#334155] px-1.5 py-0 font-mono text-[0.625rem] text-[#afafaf] dark:text-slate-500">
                              {perm.accessType}
                            </span>
                          )}
                        </td>
                        {roles.map((role) => {
                          const key = `${role.id}|${perm.namespace}|${perm.name}`;
                          const checked = localGrantSet[key] ?? false;
                          const saving = savingRoleId === role.id;
                          return (
                            <td key={role.id} className="px-3 py-2 text-center">
                              {isCloudEngineerEnabled ? (
                                <Switch
                                  checked={checked}
                                  onCheckedChange={() =>
                                    handleToggle(
                                      role.id,
                                      perm.namespace,
                                      perm.name,
                                    )
                                  }
                                  disabled={saving}
                                  aria-label={`${perm.name} for ${role.name}`}
                                />
                              ) : (
                                checked && (
                                  <Check
                                    size={14}
                                    strokeWidth={2.5}
                                    className="inline text-[#0e7cc1] dark:text-[#60a5fa]"
                                    aria-label="Granted"
                                  />
                                )
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
