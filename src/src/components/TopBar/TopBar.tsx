import React, { useContext, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Menu } from "lucide-react";
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
    return [
      { label: "Capabilities", to: "/capabilities" },
      { label: capabilityId },
    ];
  }
  if (pathname.startsWith("/release-notes/")) {
    return [
      { label: "Release Notes", to: "/release-notes" },
      { label: "Note" },
    ];
  }
  return [];
}

interface TopBarProps {
  onMenuOpen?: () => void;
  menuOpen?: boolean;
}

export default function TopBar({ onMenuOpen, menuOpen = false }: TopBarProps) {
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
    <div className="h-[52px] flex-shrink-0 flex items-center justify-between px-4 md:px-6 bg-surface border-b border-card sticky top-0 z-10">
      {/* Left side: hamburger + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={onMenuOpen}
          className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-[6px] text-secondary hover:bg-[#f2f2f2] dark:hover:bg-[#1e2d3d] border-0 bg-transparent cursor-pointer"
          aria-label="Open navigation"
          aria-expanded={menuOpen}
          aria-controls="sidebar-nav"
        >
          <Menu size={18} strokeWidth={1.75} aria-hidden="true" />
        </button>

        {/* Breadcrumb — desktop: full trail, mobile: current page only */}
        <nav
          aria-label="Breadcrumb"
          className="hidden md:flex items-center gap-1.5 text-[13px]"
        >
          <Link
            to="/"
            className="text-muted hover:text-primary no-underline transition-colors"
          >
            Developer Portal
          </Link>
          {crumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              <ChevronRight
                size={12}
                className="text-muted"
                aria-hidden="true"
              />
              {crumb.to ? (
                <Link
                  to={crumb.to}
                  className="text-muted hover:text-primary no-underline transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-primary font-medium" aria-current="page">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
        {crumbs.length > 0 && (
          <span className="md:hidden text-[13px] font-medium text-primary truncate max-w-[180px]">
            {crumbs[crumbs.length - 1].label}
          </span>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {actions}
        {/* CE Mode toggle */}
        {isCloudEngineer && (
          <div className="flex items-center gap-2 select-none">
            <span
              id="ce-mode-label"
              className="text-[10px] font-semibold tracking-[0.08em] uppercase text-muted font-mono"
            >
              CE Mode
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isCloudEngineerEnabled}
              aria-labelledby="ce-mode-label"
              onClick={() =>
                setIsCloudEngineerEnabled((prev: boolean) => !prev)
              }
              className={`relative inline-flex h-5 w-9 rounded-full overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#002b45] cursor-pointer before:content-[''] before:absolute before:-inset-[10px] [transition:background-color_200ms_50ms_cubic-bezier(0.16,1,0.3,1)] ${
                isCloudEngineerEnabled
                  ? "bg-[#1b63c1]"
                  : "bg-[#d9dcde] dark:bg-[#334155]"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm z-10 [transition:translate_200ms_cubic-bezier(0.16,1,0.3,1)] ${
                  isCloudEngineerEnabled
                    ? "translate-x-4 animate-switch-slider-on"
                    : "translate-x-0.5 animate-switch-slider-off"
                }`}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
