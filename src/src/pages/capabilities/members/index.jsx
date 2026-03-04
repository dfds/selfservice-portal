import React, { useContext, useEffect, useState } from "react";
import { TabbedPageSection } from "../../../components/PageSection";
import SelectedCapabilityContext from "../SelectedCapabilityContext";
import AppContext from "../../../AppContext";
import { MembershipApplicationsUserCanApprove } from "../membershipapplications";
import { useMembershipApplications } from "@/state/remote/queries/membershipApplications";
import Select from "react-select";
import { useGrantRole } from "@/state/remote/queries/rbac";
import { useTheme } from "@/context/ThemeContext";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Banner } from "@/components/ui/banner";
import { useQueryClient } from "@tanstack/react-query";

function MemberRow({ member, roleTypes }) {
  const {
    id: capabilityId,
    userIsOwner,
  } = useContext(SelectedCapabilityContext);
  const { myProfile: user } = useContext(AppContext);
  const { mutate: grantRoleMutation, isPending } = useGrantRole();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState(member.role);
  const [showSuccess, setShowSuccess] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    setSelectedRole(member.role);
  }, [member.role]);

  const grantRole = (memberEmail, roleId, newRole) => {
    grantRoleMutation(
      {
        payload: {
          roleId: roleId,
          assignedEntityType: "User",
          assignedEntityId: memberEmail,
          type: "Capability",
          resource: capabilityId,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["rbac", "user-roles", capabilityId] });
          queryClient.invalidateQueries({ queryKey: ["capabilities", "details", capabilityId] });
          setSelectedRole(newRole);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        },
      },
    );
  };

  return (
    <div className="border-b border-[#eeeeee] dark:border-[#1e2d3d] last:border-0">
      <div className="flex items-center gap-3 py-2">
      <UserAvatar name={member.name} pictureUrl={member.pictureUrl} size="md" />
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-[#002b45] dark:text-[#e2e8f0] leading-none mb-[2px]">
          {member.name}
        </div>
        <div className="font-mono text-[11px] text-[#afafaf] dark:text-slate-500">
          {member.email}
        </div>
      </div>
      <div className="flex-shrink-0">
        <Select
          menuPortalTarget={document.body}
          menuPosition="fixed"
          value={selectedRole}
          isDisabled={!userIsOwner || member.email === user.id || isPending}
          isLoading={isPending}
          onChange={(e) => {
            grantRole(member.email, e.value, e);
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
              fontSize: "11px",
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
              fontSize: "11px",
              fontFamily: "monospace",
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              border: isDark ? "1px solid #334155" : undefined,
            }),
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            singleValue: (base) => ({ ...base, color: isDark ? "#e2e8f0" : "#002b45" }),
            placeholder: (base) => ({ ...base, color: isDark ? "#64748b" : "#afafaf" }),
            input: (base) => ({ ...base, fontSize: "16px", color: isDark ? "#e2e8f0" : "#002b45" }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isSelected
                ? (isDark ? "#1d4ed8" : "#0e7cc1")
                : state.isFocused
                  ? (isDark ? "#0f172a" : "#f2f2f2")
                  : (isDark ? "#1e293b" : "#ffffff"),
              color: state.isSelected ? "#ffffff" : (isDark ? "#e2e8f0" : "#002b45"),
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
    {showSuccess && (
      <Banner variant="success" className="mb-2" countdown={3000}>
        Role updated successfully.
      </Banner>
    )}
  </div>
);
}

export default function Members({ roleTypes }) {
  const { members } = useContext(SelectedCapabilityContext);

  return (
    <div>
      {(members || []).map((member) => (
        <MemberRow key={member.email} member={member} roleTypes={roleTypes} />
      ))}
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

  const applicationCount = (capabilityApplications || []).length;

  const tabs = {
    members: "Current Members",
    applications: (
      <span className="flex items-center gap-1.5">
        Membership Applications
        {applicationCount > 0 && (
          <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#be1e2d] px-1 font-mono text-[10px] font-bold leading-none text-white">
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
      tabs={tabs}
      tabsContent={tabsContent}
      header={header}
      footer={footer}
    />
  );
}
