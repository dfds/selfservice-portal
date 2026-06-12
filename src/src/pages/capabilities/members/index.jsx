import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TabbedPageSection } from "../../../components/PageSection";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import AppContext from "../../../AppContext";
import { MembershipApplicationsUserCanApprove } from "../membershipapplications";
import { useMembershipApplications } from "@/state/remote/queries/membershipApplications";
import Select from "react-select";
import { useGrantRole } from "@/state/remote/queries/rbac";
import { useTheme } from "@/context/ThemeContext";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Banner } from "@/components/ui/banner";
import { useQueryClient } from "@tanstack/react-query";
import {
  useRemoveCapabilityMember,
  useAddServicePrincipalCapabilityMember,
} from "@/state/remote/queries/capabilities";
import { ServicePrincipalSearchCombobox } from "@/components/ServicePrincipalSearchCombobox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutationToast } from "@/hooks/useMutationToast";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useRybbit } from "@/RybbitContext";
import { KeyRound, Copy, Check } from "lucide-react";

function MemberRow({ member, roleTypes }) {
  const { id: capabilityId, userIsOwner } = useContext(
    SelectedCapabilityContext,
  );
  const { myProfile: user } = useContext(AppContext);
  const { mutate: grantRoleMutation, isPending } = useGrantRole();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState(member.role);
  const [showSuccess, setShowSuccess] = useState(false);
  const { isDark } = useTheme();

  const removeMemberMutation = useRemoveCapabilityMember();
  const { trackEvent } = useRybbit();
  const removeConfirm = useConfirmAction({
    mutation: removeMemberMutation,
    buildPayload: (m) => ({ capabilityId, memberId: m.id }),
    invalidateKeys: [
      ["capabilities", "members", "detailed", capabilityId],
      ["capabilities", "details", capabilityId],
    ],
    successMessage: "Member removed",
    errorMessage: "Could not remove member",
    onSuccess: () => {
      trackEvent("membership:member:removed", {
        capability_id: capabilityId,
      });
    },
  });

  useEffect(() => {
    setSelectedRole(member.role);
  }, [member.role]);

  const grantRole = (memberId, roleId, newRole) => {
    grantRoleMutation(
      {
        payload: {
          roleId: roleId,
          assignedEntityType: "User",
          assignedEntityId: memberId,
          type: "Capability",
          resource: capabilityId,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["rbac", "user-roles", capabilityId],
          });
          queryClient.invalidateQueries({
            queryKey: ["capabilities", "details", capabilityId],
          });
          setSelectedRole(newRole);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        },
      },
    );
  };

  const isServicePrincipal = member.type === "service-principal";
  const [copied, setCopied] = useState(false);
  const handleCopyOid = () => {
    if (!member.servicePrincipalOid && !member.id) return;
    navigator.clipboard
      ?.writeText(member.servicePrincipalOid || member.id)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
  };

  return (
    <div className="border-b border-[#eeeeee] dark:border-[#1e2d3d] last:border-0">
      <div className="flex flex-col gap-2 py-2 md:flex-row md:items-center md:gap-3">
        <div className="flex items-center gap-3 min-w-0 md:flex-1">
          {isServicePrincipal ? (
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#eef0f1] dark:bg-[#1e2d3d] text-[#0e7cc1] dark:text-[#60a5fa]">
              <KeyRound size={14} />
            </div>
          ) : (
            <UserAvatar
              name={member.name}
              pictureUrl={member.pictureUrl}
              size="md"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-[2px]">
              <span className="text-[0.8125rem] font-medium text-[#002b45] dark:text-[#e2e8f0] leading-tight min-w-0">
                {member.name || member.id}
              </span>
              {isServicePrincipal && (
                <Badge
                  variant="soft-warning"
                  className="font-mono text-[0.625rem] whitespace-nowrap flex-shrink-0 ml-auto md:ml-0"
                >
                  Service account
                </Badge>
              )}
            </div>
            {isServicePrincipal ? (
              <div className="flex flex-col gap-[2px]">
                <button
                  type="button"
                  onClick={handleCopyOid}
                  title="Copy service principal object id"
                  className="font-mono text-[0.6875rem] text-[#afafaf] dark:text-slate-500 hover:text-[#0e7cc1] dark:hover:text-[#60a5fa] flex items-center gap-1"
                >
                  <span className="min-w-0 break-all text-left md:truncate">
                    {member.servicePrincipalOid || member.id}
                  </span>
                  {copied ? <Check size={11} /> : <Copy size={11} />}
                </button>
                {member.email && (
                  <div className="font-mono text-[0.6875rem] text-[#afafaf] dark:text-slate-500 break-all md:truncate">
                    {member.email}
                  </div>
                )}
              </div>
            ) : (
              <div className="font-mono text-[0.6875rem] text-[#afafaf] dark:text-slate-500">
                {member.email}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 md:flex-shrink-0 md:ml-auto">
          {userIsOwner && (isServicePrincipal || member.email !== user.id) && (
            <button
              onClick={() => removeConfirm.setTarget(member)}
              className="font-mono text-[0.6875rem] text-[#aaaaaa] dark:text-[#64748b] hover:text-[#555555] dark:hover:text-[#94a3b8] hover:underline flex-shrink-0"
            >
              remove
            </button>
          )}
          <div className="flex-shrink-0">
            <Select
              menuPortalTarget={document.body}
              menuPosition="fixed"
              value={selectedRole}
              isDisabled={!userIsOwner || member.email === user.id || isPending}
              isLoading={isPending}
              onChange={(e) => {
                grantRole(member.id, e.value, e);
              }}
              options={roleTypes.map((role) => ({
                value: role.id,
                label: role.name,
              }))}
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "30px",
                  height: "30px",
                  fontSize: "0.6875rem",
                  fontFamily: "monospace",
                  border: `1px solid ${isDark ? "#334155" : "#d9dcde"}`,
                  boxShadow: "none",
                  minWidth: "160px",
                  backgroundColor: isDark ? "#0f172a" : "#ffffff",
                }),
                valueContainer: (base) => ({ ...base, padding: "0 8px" }),
                indicatorsContainer: (base) => ({ ...base, height: "30px" }),
                menu: (base) => ({
                  ...base,
                  fontSize: "0.6875rem",
                  fontFamily: "monospace",
                  backgroundColor: isDark ? "#1e293b" : "#ffffff",
                  border: isDark ? "1px solid #334155" : undefined,
                }),
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                singleValue: (base) => ({
                  ...base,
                  color: isDark ? "#e2e8f0" : "#002b45",
                }),
                placeholder: (base) => ({
                  ...base,
                  color: isDark ? "#64748b" : "#afafaf",
                }),
                input: (base) => ({
                  ...base,
                  fontSize: "1rem",
                  color: isDark ? "#e2e8f0" : "#002b45",
                }),
                option: (base, state) => ({
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
                indicatorSeparator: (base) => ({
                  ...base,
                  backgroundColor: isDark ? "#334155" : "#d9dcde",
                }),
                dropdownIndicator: (base) => ({
                  ...base,
                  color: isDark ? "#64748b" : "#afafaf",
                }),
              }}
            />
          </div>
        </div>
      </div>
      {showSuccess && (
        <Banner variant="success" className="mb-2" countdown={3000}>
          Role updated successfully.
        </Banner>
      )}
      <ConfirmDialog
        {...removeConfirm.dialogProps}
        title="Remove member"
        description={
          <>
            Are you sure you want to remove{" "}
            <strong>{removeConfirm.target?.name}</strong> from this capability?
          </>
        }
        confirmLabel="Remove"
        confirmLoadingLabel="Removing…"
        onConfirm={removeConfirm.confirm}
      />
    </div>
  );
}

function AddServicePrincipalDialog({ open, onClose, capabilityId }) {
  const [selected, setSelected] = useState(null);
  const addMutation = useAddServicePrincipalCapabilityMember();
  const fireAdd = useMutationToast(addMutation, {
    invalidateKeys: [
      ["capabilities", "members", "detailed", capabilityId],
      ["capabilities", "details", capabilityId],
    ],
    successMessage: (_data, vars) =>
      `Added service account ${
        vars?.appDisplayName || vars?.servicePrincipalId
      }`,
    errorMessage: "Could not add service account",
    onSuccess: () => {
      setSelected(null);
      onClose();
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
          <DialogTitle>Add service account</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <p className="text-sm text-secondary">
            Search Azure AD for the service principal you want to grant access
            to this capability. The oid shown next to each result is the only
            durable identifier — make sure you pick the right one.
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
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="action"
              disabled={!selected || addMutation.isPending}
              onClick={() =>
                fireAdd({
                  capabilityId,
                  servicePrincipalId: selected.id,
                  appDisplayName: selected.displayName,
                })
              }
            >
              {addMutation.isPending ? "Adding…" : "Add"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Members({ roleTypes }) {
  const {
    members,
    id: capabilityId,
    links,
  } = useContext(SelectedCapabilityContext);
  const canAddServicePrincipal = (
    links?.servicePrincipalMembers?.allow || []
  ).includes("POST");
  const [showAddDialog, setShowAddDialog] = useState(false);

  return (
    <div>
      {canAddServicePrincipal && (
        <div className="mb-3 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddDialog(true)}
          >
            <KeyRound size={14} className="mr-1.5" />
            Add service account
          </Button>
        </div>
      )}
      {(members || []).map((member) => (
        <MemberRow
          key={member.id || member.email}
          member={member}
          roleTypes={roleTypes}
        />
      ))}
      <AddServicePrincipalDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        capabilityId={capabilityId}
      />
    </div>
  );
}

export function TabbedMembersView({ anchorId }) {
  const {
    isFetched: fetchedOtherApplications,
    isRefetchting: refetchingOtherApplications,
    data: otherApplicationsData,
  } = useMembershipApplications();
  const { id: capabilityId, availableRoles } = useContext(
    SelectedCapabilityContext,
  );

  const [capabilityApplications, setCapabilityApplications] = useState([]);

  useEffect(() => {
    if (capabilityId && otherApplicationsData) {
      // filter otherApplicationsData to only include applications for this capability
      setCapabilityApplications(
        otherApplicationsData.filter(
          (app) => app.capabilityId === capabilityId,
        ),
      );
    } else {
      setCapabilityApplications(otherApplicationsData);
    }
  }, [otherApplicationsData, capabilityId]);

  const header = <></>;
  const footer = <></>;

  const headlineChildren = (
    <Link
      to="/rbac/permissions"
      className="font-mono text-[0.6875rem] text-[#0e7cc1] dark:text-[#60a5fa] hover:underline"
    >
      View permission matrix →
    </Link>
  );

  const applicationCount = (capabilityApplications || []).length;

  const tabs = {
    members: "Current Members",
    applications: (
      <span className="flex items-center gap-1.5">
        Membership Applications
        {applicationCount > 0 && (
          <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#be1e2d] px-1 font-mono text-[0.625rem] font-bold leading-none text-white">
            {applicationCount}
          </span>
        )}
      </span>
    ),
  };

  const tabsContent = {
    members: <Members roleTypes={availableRoles} />,
    applications: (
      <MembershipApplicationsUserCanApprove
        data={capabilityApplications}
        isFetched={fetchedOtherApplications}
        isRefetching={refetchingOtherApplications}
      />
    ),
  };

  return (
    <TabbedPageSection
      id={anchorId}
      headline="Capability Member Management"
      headlineChildren={headlineChildren}
      tabs={tabs}
      tabsContent={tabsContent}
      header={header}
      footer={footer}
    />
  );
}
