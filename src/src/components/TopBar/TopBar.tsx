import React, { useContext, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import AppContext from "@/AppContext";
import PreAppContext from "../../preAppContext";
import { useTopBarActions } from "./TopBarActionsContext";

function checkIfCloudEngineer(roles: string[]): boolean {
  const regex = /^\s*cloud\.engineer\s*$/i;
  return roles?.some((r) => regex.test(r.toLowerCase())) ?? false;
}


const pathLabels: Record<string, string> = {
  "/": "Home",
  "/capabilities": "Capabilities",
  "/topics": "Topics",
  "/ecr": "ECR Repositories",
  "/release-notes": "Release Notes",
  "/demos": "Demos",
  "/capabilities/criticality": "Criticality",
  "/capabilities/selfassessments": "Self Assessments",
};

interface Crumb {
  label: string;
  to?: string;
}

function getBreadcrumbs(pathname: string): Crumb[] {
  if (pathLabels[pathname]) {
    const label = pathLabels[pathname];
    return label === "Home" ? [] : [{ label }];
  }
  if (/^\/capabilities\/[^/]+$/.test(pathname)) {
    const capabilityId = pathname.split("/")[2];
    return [{ label: "Capabilities", to: "/capabilities" }, { label: capabilityId }];
  }
  if (pathname.startsWith("/release-notes/")) {
    return [{ label: "Release Notes", to: "/release-notes" }, { label: "Note" }];
  }
  return [];
}

export default function TopBar() {
  const { user } = useContext(AppContext);
  const { isCloudEngineerEnabled, setIsCloudEngineerEnabled } =
    useContext(PreAppContext);
  const location = useLocation();
  const { actions } = useTopBarActions();

  const isCloudEngineer = useMemo(
    () => checkIfCloudEngineer(user?.roles ?? []),
    [user?.roles],
  );

  const crumbs = getBreadcrumbs(location.pathname);

  return (
    <div className="h-[52px] flex-shrink-0 flex items-center justify-between px-6 bg-white dark:bg-[#1e293b] border-b border-[#d9dcde] dark:border-[#334155] sticky top-0 z-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[13px]">
        <Link
          to="/"
          className="text-[#afafaf] dark:text-[#64748b] hover:text-[#002b45] dark:hover:text-[#e2e8f0] no-underline transition-colors"
        >
          Developer Portal
        </Link>
        {crumbs.map((crumb, i) => (
          <React.Fragment key={i}>
            <ChevronRight size={12} className="text-[#afafaf] dark:text-[#64748b]" />
            {crumb.to ? (
              <Link
                to={crumb.to}
                className="text-[#afafaf] dark:text-[#64748b] hover:text-[#002b45] dark:hover:text-[#e2e8f0] no-underline transition-colors"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-[#002b45] dark:text-[#e2e8f0] font-medium">{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {actions}
        {/* CE Mode toggle */}
        {isCloudEngineer && (
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#afafaf] dark:text-[#64748b] font-mono">
              CE Mode
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isCloudEngineerEnabled}
              onClick={() =>
                setIsCloudEngineerEnabled((prev: boolean) => !prev)
              }
              className={`relative inline-flex h-5 w-9 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#002b45] cursor-pointer ${
                isCloudEngineerEnabled ? "bg-[#002b45] dark:bg-[#60a5fa]" : "bg-[#d9dcde] dark:bg-[#334155]"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  isCloudEngineerEnabled ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>
          </label>
        )}

      </div>
    </div>
  );
}
