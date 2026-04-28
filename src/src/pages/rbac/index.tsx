import React from "react";
import { Check } from "lucide-react";
import { usePermissionMatrix } from "@/state/remote/queries/rbac";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionLabel } from "@/components/ui/SectionLabel";

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
    const matrix = data as PermissionMatrixResponse | undefined;

    const roles: RbacRoleDTO[] = matrix?.roles ?? [];
    const permissions: PermissionDto[] = matrix?.permissions ?? [];
    const grants: PermissionMatrixGrantDto[] = matrix?.grants ?? [];

    // Build a lookup set: "roleId|namespace|permission" → true
    const grantSet = new Set<string>(
        grants.map((g) => `${g.roleId}|${g.namespace}|${g.permission}`),
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
                <div className="font-mono text-[11px] font-semibold tracking-[0.15em] uppercase text-[#0e7cc1] dark:text-[#60a5fa] mb-1">
          // RBAC
                </div>
                <h1 className="text-[1.6rem] font-bold text-[#002b45] dark:text-[#e2e8f0]">
                    Permission Matrix
                </h1>
                <p className="mt-1 text-[13px] text-[#6b7280] dark:text-slate-400">
                    An overview of which permissions are granted to each role in the
                    system.
                </p>
            </div>

            {isFetching && !isFetched && (
                <div className="space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-8 w-full rounded" />
                    ))}
                </div>
            )}

            {isFetched && roles.length === 0 && (
                <p className="text-[13px] text-muted font-mono">
                    No permission matrix data available.
                </p>
            )}

            {isFetched && roles.length > 0 && (
                <div className="bg-white dark:bg-[#1e293b] border border-[#d9dcde] dark:border-[#334155] rounded-[8px] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-[12px]">
                            <thead>
                                <tr className="border-b border-[#eeeeee] dark:border-[#1e2d3d]">
                                    <th className="sticky left-0 z-10 bg-white dark:bg-[#1e293b] px-4 py-3 text-left font-mono text-[11px] text-[#afafaf] dark:text-slate-500 min-w-[220px] border-r border-[#eeeeee] dark:border-[#1e2d3d]">
                                        Permission
                                    </th>
                                    {roles.map((role) => (
                                        <th
                                            key={role.id}
                                            title={role.description ?? role.name}
                                            className="px-3 py-3 text-center font-mono text-[11px] text-[#002b45] dark:text-[#e2e8f0] whitespace-nowrap min-w-[120px]"
                                        >
                                            {role.name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {namespaces.map((ns) => (
                                    <React.Fragment key={ns}>
                                        {/* Namespace header row */}
                                        <tr className="bg-[#f8f9fa] dark:bg-[#0f172a]">
                                            <td
                                                colSpan={roles.length + 1}
                                                className="sticky left-0 px-4 py-1.5"
                                            >
                                                <SectionLabel>{ns}</SectionLabel>
                                            </td>
                                        </tr>
                                        {/* Permission rows */}
                                        {permissionsByNamespace[ns].map((perm) => (
                                            <tr
                                                key={`${perm.namespace}|${perm.name}`}
                                                className="border-t border-[#eeeeee] dark:border-[#1e2d3d] hover:bg-[#f8f9fa] dark:hover:bg-[#0f172a]/50"
                                            >
                                                <td className="sticky left-0 z-10 bg-white dark:bg-[#1e293b] hover:bg-[#f8f9fa] dark:hover:bg-[#0f172a]/50 px-4 py-2 border-r border-[#eeeeee] dark:border-[#1e2d3d]">
                                                    <span
                                                        className="font-mono text-[11px] text-[#002b45] dark:text-[#e2e8f0]"
                                                        title={perm.description}
                                                    >
                                                        {perm.name}
                                                    </span>
                                                    {perm.accessType && (
                                                        <span className="ml-2 inline-flex items-center rounded-full border border-[#d9dcde] dark:border-[#334155] px-1.5 py-0 font-mono text-[10px] text-[#afafaf] dark:text-slate-500">
                                                            {perm.accessType}
                                                        </span>
                                                    )}
                                                </td>
                                                {roles.map((role) => {
                                                    const hasGrant = grantSet.has(
                                                        `${role.id}|${perm.namespace}|${perm.name}`,
                                                    );
                                                    return (
                                                        <td
                                                            key={role.id}
                                                            className="px-3 py-2 text-center"
                                                        >
                                                            {hasGrant && (
                                                                <Check
                                                                    size={14}
                                                                    strokeWidth={2.5}
                                                                    className="inline text-[#0e7cc1] dark:text-[#60a5fa]"
                                                                    aria-label="Granted"
                                                                />
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
