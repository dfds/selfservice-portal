import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Layers,
  List,
  Package,
  FileText,
  Play,
  BookOpen,
  Activity,
  ExternalLink,
  BarChart2,
  ClipboardCheck,
  Sun,
  Moon,
  Monitor,
  LogOut,
  RefreshCw,
  ChevronUp,
} from "lucide-react";
import AppContext from "@/AppContext";
import PreAppContext from "../../preAppContext";
import { cn } from "@/lib/utils";
import { useTheme, type Theme } from "@/context/ThemeContext";
import { msalInstance, selfServiceApiScopes } from "@/auth/context";
import { UserAvatar } from "@/components/ui/UserAvatar";

function checkIfCloudEngineer(roles: string[]): boolean {
  const regex = /^\s*cloud\.engineer\s*$/i;
  return roles?.some((r) => regex.test(r.toLowerCase())) ?? false;
}

function DfdsHexMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 70 50" className={className} aria-hidden="true">
      <path
        d="M69.4 0H29.18a.9.9 0 0 0-.85.5L.07 49.46a.33.33 0 0 0 .06.47.32.32 0 0 0 .27.07h40.2a.89.89 0 0 0 .86-.49L69.72.54a.33.33 0 0 0-.07-.47.32.32 0 0 0-.25-.07zm-23 32a.28.28 0 0 1-.27.28.42.42 0 0 1-.15 0l-9.2-5.31 5.31 9.2a.28.28 0 0 1-.1.38.33.33 0 0 1-.14 0H27.94a.28.28 0 0 1-.28-.28.23.23 0 0 1 0-.14l5.3-9.2-9.17 5.27a.28.28 0 0 1-.38-.11.31.31 0 0 1 0-.13V18a.27.27 0 0 1 .28-.27.28.28 0 0 1 .13 0L33 23.11l-5.31-9.2a.28.28 0 0 1 .1-.38.33.33 0 0 1 .14 0h13.91a.29.29 0 0 1 .28.28.23.23 0 0 1 0 .14l-5.31 9.2L46 17.8a.27.27 0 0 1 .38.1.23.23 0 0 1 0 .14z"
        fill="currentColor"
      />
    </svg>
  );
}

interface NavItemDef {
  title: string;
  url: string;
  icon: React.ElementType;
  external?: boolean;
}

const platformNav: NavItemDef[] = [
  { title: "Home", url: "/", icon: Home },
  { title: "Capabilities", url: "/capabilities", icon: Layers },
  { title: "Topics", url: "/topics", icon: List },
  { title: "ECR", url: "/ecr", icon: Package },
];

const contentNav: NavItemDef[] = [
  { title: "Release Notes", url: "/release-notes", icon: FileText },
  { title: "Demos", url: "/demos", icon: Play },
];

const externalNav: NavItemDef[] = [
  {
    title: "Playbooks",
    url: "https://wiki.dfds.cloud/playbooks",
    icon: BookOpen,
    external: true,
  },
  {
    title: "Status",
    url: "https://dfdsit.statuspage.io/",
    icon: Activity,
    external: true,
  },
];

const ceNav: NavItemDef[] = [
  { title: "Criticality", url: "/capabilities/criticality", icon: BarChart2 },
  {
    title: "Self Assessments",
    url: "/capabilities/selfassessments",
    icon: ClipboardCheck,
  },
];

function NavItemLink({
  item,
  isActive,
}: {
  item: NavItemDef;
  isActive: boolean;
}) {
  const Icon = item.icon;
  const cls = cn(
    "flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-[13px] no-underline transition-colors",
    isActive
      ? "bg-white dark:bg-slate-700 text-[#002b45] dark:text-[#e2e8f0] font-medium shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
      : "text-[#546071] dark:text-[#94a3b8] hover:bg-white/60 dark:hover:bg-slate-700/60 hover:text-[#002b45] dark:hover:text-[#e2e8f0]",
  );

  if (item.external) {
    return (
      <a
        href={item.url}
        className={cls}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Icon size={15} strokeWidth={1.75} className="flex-shrink-0" />
        <span>{item.title}</span>
        <ExternalLink size={10} className="ml-auto opacity-40" />
      </a>
    );
  }

  return (
    <Link to={item.url} className={cls}>
      <Icon size={15} strokeWidth={1.75} className="flex-shrink-0" />
      <span>{item.title}</span>
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pb-1.5 text-[10px] font-semibold tracking-[0.08em] uppercase text-[#afafaf] dark:text-[#64748b] font-mono">
      {children}
    </div>
  );
}

const THEME_OPTIONS: { value: Theme; icon: React.ElementType; label: string }[] = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "Auto" },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex items-center bg-[#dde0e2] dark:bg-[#1e2d3d] rounded-[6px] p-0.5 gap-0.5">
      {THEME_OPTIONS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          title={label}
          onClick={() => setTheme(value)}
          className={cn(
            "flex flex-1 items-center justify-center gap-1 py-1 rounded-[4px] text-[10px] font-mono transition-colors cursor-pointer border-0",
            theme === value
              ? "bg-white dark:bg-slate-600 text-[#002b45] dark:text-white shadow-sm"
              : "text-[#afafaf] dark:text-[#64748b] hover:text-[#666666] dark:hover:text-[#94a3b8] bg-transparent",
          )}
        >
          <Icon size={11} strokeWidth={1.75} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

function UserMenu({ user }: { user: { name?: string; title?: string; profilePictureUrl?: string } | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const signOut = () => {
    msalInstance.logoutRedirect();
  };

  const refreshSession = () => {
    msalInstance.acquireTokenRedirect({
      scopes: selfServiceApiScopes,
      prompt: "login",
    });
  };

  return (
    <div ref={ref} className="relative -mx-3 -mb-3">
      {open && (
        <div className="absolute bottom-full left-3 right-3 mb-1.5 rounded-[8px] border border-[#d9dcde] dark:border-[#334155] bg-white dark:bg-[#1e293b] shadow-[0px_8px_16px_rgba(0,0,0,0.12)] overflow-hidden">
          <button
            type="button"
            onClick={() => { refreshSession(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] text-[#002b45] dark:text-[#e2e8f0] hover:bg-[#f2f2f2] dark:hover:bg-[#334155] cursor-pointer border-0 bg-transparent text-left transition-colors"
          >
            <RefreshCw size={13} strokeWidth={1.75} className="flex-shrink-0 text-[#0e7cc1] dark:text-[#60a5fa]" />
            Refresh session
          </button>
          <div className="h-px bg-[#eeeeee] dark:bg-[#1e2d3d]" />
          <button
            type="button"
            onClick={() => { signOut(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[12px] text-[#be1e2d] hover:bg-[#f2f2f2] dark:hover:bg-[#334155] cursor-pointer border-0 bg-transparent text-left transition-colors"
          >
            <LogOut size={13} strokeWidth={1.75} className="flex-shrink-0" />
            Sign out
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center gap-2.5 px-5 pt-2 pb-5 cursor-pointer border-0 bg-transparent text-left transition-colors",
          open
            ? "bg-white dark:bg-slate-700/60"
            : "hover:bg-white dark:hover:bg-slate-700/60",
        )}
      >
        <UserAvatar name={user?.name} pictureUrl={user?.profilePictureUrl} size="lg" className="dark:bg-slate-600" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[12px] font-medium text-[#002b45] dark:text-[#e2e8f0] truncate">
            {user?.name ?? ""}
          </span>
          <span className="text-[11px] text-[#afafaf] dark:text-[#64748b] truncate">
            {user?.title ?? ""}
          </span>
        </div>
        <ChevronUp
          size={13}
          strokeWidth={1.75}
          className={cn(
            "flex-shrink-0 text-[#afafaf] dark:text-[#64748b] transition-transform duration-150",
            open ? "rotate-180" : "",
          )}
        />
      </button>
    </div>
  );
}

export default function Sidebar() {
  const { user } = useContext(AppContext);
  const { isCloudEngineerEnabled, setIsCloudEngineerEnabled } =
    useContext(PreAppContext);
  const location = useLocation();

  const isCloudEngineer = useMemo(
    () => checkIfCloudEngineer(user?.roles ?? []),
    [user?.roles],
  );

  // Auto-enable CE mode when user is a cloud engineer (mirrors Header.tsx behavior)
  useEffect(() => {
    if (user?.isAuthenticated && isCloudEngineer) {
      setIsCloudEngineerEnabled(true);
    }
  }, [isCloudEngineer]);

  function isActive(url: string): boolean {
    if (url === "/") return location.pathname === "/";
    if (location.pathname === url) return true;
    if (location.pathname.startsWith(url + "/")) {
      // Don't match prefix if a more-specific nav item matches
      const allNavItems = [...platformNav, ...contentNav, ...ceNav];
      const hasMoreSpecificMatch = allNavItems.some(
        (item) => item.url !== url && location.pathname.startsWith(item.url),
      );
      return !hasMoreSpecificMatch;
    }
    return false;
  }

  return (
    <aside
      className="w-[220px] flex-shrink-0 flex flex-col sticky top-0 h-screen bg-[#eef0f1] dark:bg-[#141e2b] border-r border-[#d9dcde] dark:border-[#334155]"
      style={{ zIndex: 20 }}
    >
      {/* Logo */}
      <Link
        to="/"
        className="flex items-center gap-2.5 px-4 h-[52px] border-b border-[#d9dcde] dark:border-[#334155] no-underline flex-shrink-0"
        aria-label="DFDS Self Service home"
      >
        <DfdsHexMark className="h-7 w-auto text-[#002b45] dark:text-[#e2e8f0] flex-shrink-0" />
        <div className="flex flex-col leading-tight">
          <span className="text-[9px] font-semibold tracking-[0.08em] uppercase text-[#afafaf] dark:text-[#64748b] font-mono">
            DFDS
          </span>
          <span className="text-[12px] font-bold text-[#002b45] dark:text-[#e2e8f0] leading-none font-mono">
            Self Service
          </span>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-5 overflow-y-auto">
        {/* PLATFORM */}
        <div>
          <SectionLabel>Platform</SectionLabel>
          <div className="flex flex-col gap-0.5">
            {platformNav.map((item) => (
              <NavItemLink
                key={item.url}
                item={item}
                isActive={isActive(item.url)}
              />
            ))}
            {isCloudEngineerEnabled &&
              ceNav.map((item) => (
                <NavItemLink
                  key={item.url}
                  item={item}
                  isActive={isActive(item.url)}
                />
              ))}
          </div>
        </div>

        {/* CONTENT */}
        <div>
          <SectionLabel>Content</SectionLabel>
          <div className="flex flex-col gap-0.5">
            {contentNav.map((item) => (
              <NavItemLink
                key={item.url}
                item={item}
                isActive={isActive(item.url)}
              />
            ))}
          </div>
        </div>

        {/* EXTERNAL */}
        <div>
          <SectionLabel>External</SectionLabel>
          <div className="flex flex-col gap-0.5">
            {externalNav.map((item) => (
              <NavItemLink
                key={item.url}
                item={item}
                isActive={isActive(item.url)}
              />
            ))}
          </div>
        </div>
      </nav>

      {/* Commit hash */}
      {process.env.REACT_APP_COMMIT_HASH && (
        <div className="pb-2 text-[10px] font-mono text-[#c4c8cc] dark:text-[#3d4f63] select-none text-center">
          {process.env.REACT_APP_COMMIT_HASH}
        </div>
      )}

      {/* Footer */}
      <div className="px-3 py-3 border-t border-[#d9dcde] dark:border-[#334155] flex-shrink-0 flex flex-col gap-2">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Profile */}
        <UserMenu user={user} />
      </div>
    </aside>
  );
}
