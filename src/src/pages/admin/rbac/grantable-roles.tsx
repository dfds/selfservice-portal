import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, Save } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  GrantMatrixRule,
  useGrantMatrix,
  usePermissionMatrix,
  useSetGrantMatrix,
} from "@/state/remote/queries/rbac";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { InfoAlert } from "@/components/ui/InfoAlert";
import { AdminPageHeader } from "@/components/ui/AdminPageHeader";
import { useToast } from "@/context/ToastContext";

type PermissionMatrixGrant = {
  roleId: string;
  namespace: string;
  permission: string;
};

const ruleKey = (roleId: string, grantableRoleId: string) =>
  `${roleId}|${grantableRoleId}`;

export default function GrantableRolesPage() {
  const { data, isFetched } = useGrantMatrix();
  const { data: permissionMatrix } = usePermissionMatrix();
  const { mutate: setGrantMatrix, isPending: saving } = useSetGrantMatrix();
  const queryClient = useQueryClient();
  const toast = useToast();

  const roles = data?.roles ?? [];
  const canEdit = (data?._links?.self?.allow ?? []).includes("PUT");

  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!data) return;
    const keys = new Set(
      data.rules.map((r) => ruleKey(r.roleId, r.grantableRoleId)),
    );
    setSaved(keys);
    setDraft(new Set(keys));
  }, [data]);

  const permissionsByRole = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    const grants: PermissionMatrixGrant[] = permissionMatrix?.grants ?? [];
    grants.forEach((g) => {
      (map[g.roleId] ??= new Set()).add(`${g.namespace}/${g.permission}`);
    });
    return map;
  }, [permissionMatrix]);

  // Permissions the grantable role carries that the granter does not hold.
  const missingPermissions = (roleId: string, grantableRoleId: string) => {
    const granter = permissionsByRole[roleId] ?? new Set<string>();
    return Array.from(permissionsByRole[grantableRoleId] ?? []).filter(
      (p) => !granter.has(p),
    );
  };

  const isDirty =
    draft.size !== saved.size || Array.from(draft).some((k) => !saved.has(k));

  const toggle = (key: string) =>
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const handleSave = () => {
    const rules: GrantMatrixRule[] = Array.from(draft).map((key) => {
      const [roleId, grantableRoleId] = key.split("|");
      return { roleId, grantableRoleId };
    });
    setGrantMatrix(
      { rules },
      {
        onSuccess: () => {
          setSaved(new Set(draft));
          queryClient.invalidateQueries({ queryKey: ["rbac", "grant-matrix"] });
          queryClient.invalidateQueries({
            queryKey: ["rbac", "grantable-roles"],
          });
          toast.success("Grant rules saved.");
        },
        onError: () => toast.error("Failed to save grant rules."),
      },
    );
  };

  return (
    <div className="px-5 md:px-8 py-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <AdminPageHeader
          title="Grantable Roles"
          subtitle="Which roles a capability member may give to other members of the same capability, when approving an application or changing a member's role."
        />
        {canEdit && (
          <Button
            size="sm"
            variant="action"
            onClick={handleSave}
            disabled={!isDirty || saving}
          >
            <Save size={12} />
            {saving ? "Saving…" : "Save"}
          </Button>
        )}
      </div>

      <InfoAlert variant="info" className="mb-5">
        Rows are the role a member holds on the capability; columns are the
        roles they may grant. Changing a member&apos;s role replaces their
        current one, so the current role must be grantable too. Users with
        global <code className="font-mono">rbac/create</code> may grant any role
        and are not bound by this table.
      </InfoAlert>

      {!isFetched && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded" />
          ))}
        </div>
      )}

      {isFetched && roles.length === 0 && (
        <p className="text-[0.8125rem] text-muted font-mono">
          No capability roles found.
        </p>
      )}

      {isFetched && roles.length > 0 && (
        <div className="bg-white dark:bg-[#1e293b] border border-[#d9dcde] dark:border-[#334155] rounded-[8px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[0.75rem]">
              <thead>
                <tr className="border-b border-[#eeeeee] dark:border-[#1e2d3d]">
                  <th className="sticky left-0 z-10 bg-white dark:bg-[#1e293b] px-4 py-3 text-left font-mono text-[0.6875rem] font-normal text-[#afafaf] dark:text-slate-500 min-w-[200px] border-r border-[#eeeeee] dark:border-[#1e2d3d]">
                    Holder of ↓ · may grant →
                  </th>
                  {roles.map((role) => (
                    <th
                      key={role.id}
                      title={role.description || role.name}
                      className="px-3 py-3 text-center font-mono text-[0.6875rem] text-[#002b45] dark:text-[#e2e8f0] whitespace-nowrap min-w-[120px]"
                    >
                      {role.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roles.map((granter) => (
                  <tr
                    key={granter.id}
                    className="border-t border-[#eeeeee] dark:border-[#1e2d3d] hover:bg-[#f8f9fa] dark:hover:bg-[#0f172a]/50"
                  >
                    <td className="sticky left-0 z-10 bg-white dark:bg-[#1e293b] px-4 py-2 border-r border-[#eeeeee] dark:border-[#1e2d3d] font-mono text-[0.6875rem] text-[#002b45] dark:text-[#e2e8f0]">
                      {granter.name}
                    </td>
                    {roles.map((grantable) => {
                      const key = ruleKey(granter.id, grantable.id);
                      const checked = draft.has(key);
                      const missing = checked
                        ? missingPermissions(granter.id, grantable.id)
                        : [];
                      return (
                        <td key={grantable.id} className="px-3 py-2">
                          <div className="flex items-center justify-center gap-1.5">
                            {canEdit ? (
                              <Switch
                                checked={checked}
                                onCheckedChange={() => toggle(key)}
                                disabled={saving}
                                aria-label={`${granter.name} may grant ${grantable.name}`}
                              />
                            ) : (
                              checked && (
                                <Check
                                  size={14}
                                  strokeWidth={2.5}
                                  className="text-[#0e7cc1] dark:text-[#60a5fa]"
                                  aria-label="May grant"
                                />
                              )
                            )}
                            {missing.length > 0 && (
                              <span
                                title={`${grantable.name} has ${
                                  missing.length
                                } permission${
                                  missing.length === 1 ? "" : "s"
                                } that ${granter.name} lacks: ${missing.join(
                                  ", ",
                                )}`}
                              >
                                <AlertTriangle
                                  size={13}
                                  className="text-[#ed8800]"
                                  aria-label={`${grantable.name} has permissions ${granter.name} lacks`}
                                />
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
