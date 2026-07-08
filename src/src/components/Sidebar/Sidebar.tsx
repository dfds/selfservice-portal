import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Layers,
  List,
  Package,
  FileText,
  Play,
  Newspaper,
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
  ChevronDown,
  ChevronRight,
  Building2,
  ShieldCheck,
  KeyRound,
  UserSearch,
  Network,
  X,
  Info,
  Container,
  LineChart,
  Database,
  Mail,
  Table2,
  ListChecks,
  SlidersHorizontal,
  ShieldAlert,
  Clock,
  Gauge,
} from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import AppContext from "@/AppContext";
import PreAppContext from "../../preAppContext";
import { cn } from "@/lib/utils";
import { useTheme, type Theme } from "@/context/ThemeContext";
import {
  useFontScale,
  FONT_SCALE_PRESETS,
  FONT_SCALE_MIN,
  FONT_SCALE_MAX,
} from "@/context/FontScaleContext";
import { useRybbit } from "@/RybbitContext";
import { msalInstance, selfServiceApiScopes } from "@/auth/context";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { SectionLabel } from "@/components/ui/SectionLabel";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { checkIfCloudEngineer } from "@/lib/roleUtils";
import WhatsNewBell from "@/components/TopBar/WhatsNewBell";

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

interface NavGroupDef {
  title: string;
  icon: React.ElementType;
  children: NavItemDef[];
}

const platformNav: NavItemDef[] = [
  { title: "Home", url: "/", icon: Home },
  { title: "Capabilities", url: "/capabilities", icon: Layers },
  { title: "Topics", url: "/topics", icon: List },
  { title: "Service catalogue", url: "/services", icon: Network },
  { title: "ECR", url: "/ecr", icon: Package },
  { title: "Permission Matrix", url: "/rbac/permissions", icon: Table2 },
];

const contentNav: NavItemDef[] = [
  { title: "Release Notes", url: "/release-notes", icon: FileText },
  { title: "Events", url: "/events", icon: Play },
  { title: "News", url: "/news", icon: Newspaper },
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

const costCentresGroup: NavGroupDef = {
  title: "Dashboards",
  icon: Gauge,
  children: [{ title: "Compliance", url: "/compliance", icon: ShieldCheck }],
};

// External admin links. URLs are injected from environment variables at build
// time (never hardcoded) — a link only appears when its env var is set. Add a
// new one by adding the matching REACT_APP_ADMIN_PAGE_URL_* var to the build env.
const adminExternalNav: NavItemDef[] = (
  [
    {
      title: "Audit",
      url: process.env.REACT_APP_ADMIN_PAGE_URL_AUDIT,
      icon: ClipboardCheck,
      external: true,
    },
    {
      title: "CVEs",
      url: process.env.REACT_APP_ADMIN_PAGE_URL_CVE,
      icon: ShieldAlert,
      external: true,
    },
    {
      title: "Inactivity",
      url: process.env.REACT_APP_ADMIN_PAGE_URL_INACTIVITY,
      icon: Clock,
      external: true,
    },
  ] as (Omit<NavItemDef, "url"> & { url?: string })[]
).filter((item): item is NavItemDef => !!item.url);

const adminNav: NavGroupDef = {
  title: "Admin",
  icon: ShieldCheck,
  children: [
    { title: "User Inspector", url: "/admin/rbac/user", icon: UserSearch },
    { title: "RBAC Viewer", url: "/admin/rbac", icon: KeyRound },
    {
      title: "RBAC Manage",
      url: "/admin/rbac/manage",
      icon: SlidersHorizontal,
    },
    {
      title: "RBAC Assignments",
      url: "/admin/rbac/assignments",
      icon: ListChecks,
    },
    { title: "Topic Explorer", url: "/admin/topics", icon: Network },
    {
      title: "Metadata Remediation",
      url: "/admin/capabilities/metadata",
      icon: Database,
    },
    { title: "ECR Sync", url: "/admin/ecr", icon: Container },
    { title: "Metrics", url: "/admin/metrics", icon: LineChart },
    { title: "JSON Schema Editor", url: "/admin/json-schema", icon: FileText },
    { title: "Email Campaigns", url: "/admin/email-campaigns", icon: Mail },
    ...adminExternalNav,
  ],
};

function navItemTourId(item: NavItemDef): string {
  const slug = item.url.replace(/^\//, "").replace(/\//g, "-") || "home";
  return `nav-${slug}`;
}

function NavItemLink({
  item,
  isActive,
  onPanel = false,
}: {
  item: NavItemDef;
  isActive: boolean;
  onPanel?: boolean;
}) {
  const Icon = item.icon;
  const tourId = navItemTourId(item);
  const { trackEvent } = useRybbit();
  const cls = cn(
    "flex items-center gap-2.5 px-3 py-3 md:py-2 rounded-[6px] text-[0.8125rem] no-underline transition duration-150 ease-out-expo border-l-2",
    isActive
      ? onPanel
        ? "bg-[#f2f2f2] dark:bg-slate-700 text-primary font-medium border-action"
        : "bg-white dark:bg-slate-700 text-primary font-medium shadow-card border-action"
      : onPanel
        ? "text-secondary hover:bg-[#f2f2f2] dark:hover:bg-[#334155] hover:text-primary border-transparent"
        : "text-secondary hover:bg-white/60 dark:hover:bg-slate-700/60 hover:text-primary border-transparent",
  );

  const handleNavClick = () => {
    trackEvent("nav:sidebar:clicked", {
      target: item.url,
      external: !!item.external,
    });
  };

  if (item.external) {
    return (
      <a
        href={item.url}
        data-tour={tourId}
        className={cls}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleNavClick}
      >
        <Icon
          size={15}
          strokeWidth={1.75}
          className="flex-shrink-0"
          aria-hidden="true"
        />
        <span>{item.title}</span>
        <ExternalLink
          size={10}
          className="ml-auto opacity-40"
          aria-hidden="true"
        />
        <span className="sr-only"> (opens in new tab)</span>
      </a>
    );
  }

  return (
    <Link
      to={item.url}
      data-tour={tourId}
      className={cls}
      onClick={handleNavClick}
    >
      <Icon size={15} strokeWidth={1.75} className="flex-shrink-0" />
      <span>{item.title}</span>
    </Link>
  );
}

// Shared styling for a group's top-level trigger button — matches NavItemLink.
function groupBtnCls(active: boolean): string {
  return cn(
    "w-full flex items-center gap-2.5 px-3 py-3 md:py-2 rounded-[6px] text-[0.8125rem] transition duration-150 ease-out-expo border-l-2 cursor-pointer border-t-0 border-r-0 border-b-0 bg-transparent text-left",
    active
      ? "bg-white dark:bg-slate-700 text-primary font-medium shadow-card border-action"
      : "text-secondary hover:bg-white/60 dark:hover:bg-slate-700/60 hover:text-primary border-transparent",
  );
}

const NAV_FADE = "20px";

interface ScrollEdges {
  top: boolean;
  bottom: boolean;
}

function useScrollEdges(
  ref: React.RefObject<HTMLElement | null>,
  enabled = true,
): ScrollEdges {
  const [edges, setEdges] = useState<ScrollEdges>({
    top: false,
    bottom: false,
  });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !enabled) {
      setEdges({ top: false, bottom: false });
      return;
    }

    function update() {
      if (!el) return;
      const top = el.scrollTop > 2;
      const bottom = el.scrollTop + el.clientHeight < el.scrollHeight - 2;
      setEdges((prev) =>
        prev.top === top && prev.bottom === bottom ? prev : { top, bottom },
      );
    }

    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    const mo = new MutationObserver(update);
    mo.observe(el, { childList: true, subtree: true });
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
      mo.disconnect();
    };
  }, [enabled]);

  return edges;
}

function edgeMask(edges: ScrollEdges): string {
  return `linear-gradient(to bottom, ${edges.top ? "transparent" : "black"
    } 0, black ${NAV_FADE}, black calc(100% - ${NAV_FADE}), ${edges.bottom ? "transparent" : "black"
    } 100%)`;
}

function EdgeIndicators({ edges }: { edges: ScrollEdges }) {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 right-0 mx-auto flex items-center justify-center rounded-full bg-surface border border-card shadow-card text-muted"
        style={{
          top: "0.25em",
          width: "1.5em",
          height: "1.5em",
          opacity: edges.top ? 1 : 0,
          transform: `translateY(${edges.top ? "0" : "-0.25em"})`,
          transition:
            "opacity 160ms ease, transform 220ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <ChevronUp
          className="w-[0.9em] h-[0.9em]"
          strokeWidth={2}
          aria-hidden="true"
        />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 right-0 mx-auto flex items-center justify-center rounded-full bg-surface border border-card shadow-card text-muted"
        style={{
          bottom: "0.25em",
          width: "1.5em",
          height: "1.5em",
          opacity: edges.bottom ? 1 : 0,
          transform: `translateY(${edges.bottom ? "0" : "0.25em"})`,
          transition:
            "opacity 160ms ease, transform 220ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <ChevronDown
          className="w-[0.9em] h-[0.9em]"
          strokeWidth={2}
          aria-hidden="true"
        />
      </div>
    </>
  );
}

// Inline accordion — used on mobile, where the flyout's hover/portal model
// doesn't fit the full-height drawer.
function NavGroupAccordion({
  group,
  isActive,
}: {
  group: NavGroupDef;
  isActive: (url: string) => boolean;
}) {
  const anyChildActive = group.children.some((c) => isActive(c.url));
  const [open, setOpen] = useState(anyChildActive);
  const Icon = group.icon;

  const location = useLocation();
  useEffect(() => {
    if (!anyChildActive) setOpen(false);
  }, [location.pathname]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={groupBtnCls(anyChildActive)}
      >
        <Icon
          size={15}
          strokeWidth={1.75}
          className="flex-shrink-0"
          aria-hidden="true"
        />
        <span className="flex-1">{group.title}</span>
        <ChevronDown
          size={13}
          strokeWidth={1.75}
          className={cn(
            "flex-shrink-0 text-muted transition-transform duration-200 ease-out-expo",
            open ? "rotate-180" : "",
          )}
          aria-hidden="true"
        />
      </button>
      <div
        className="overflow-hidden"
        style={{
          display: "grid",
          gridTemplateRows: open ? "1fr" : "0fr",
          transition: "grid-template-rows 220ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div className="min-h-0">
          <div className="flex flex-col gap-1 md:gap-0.5 pl-4 pt-1">
            {group.children.map((item) => (
              <NavItemLink
                key={item.url}
                item={item}
                isActive={isActive(item.url)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NavGroupFlyout({
  group,
  isActive,
}: {
  group: NavGroupDef;
  isActive: (url: string) => boolean;
}) {
  const anyChildActive = group.children.some((c) => isActive(c.url));
  const Icon = group.icon;
  const { factor } = useFontScale();
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ left: 0, top: 0, maxHeight: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const location = useLocation();

  const edges = useScrollEdges(scrollRef, open);
  const mask = edgeMask(edges);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Outside click + Escape.
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function place() {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    setCoords({
      left: (r.right + 6) / factor,
      top: r.top / factor,
      maxHeight: (window.innerHeight - r.top - 8) / factor,
    });
  }
  function openPanel() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    place();
    setOpen(true);
  }
  function scheduleClose() {
    closeTimer.current = window.setTimeout(() => setOpen(false), 140);
  }
  function cancelClose() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  }

  return (
    <div>
      <button
        ref={btnRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openPanel())}
        onMouseEnter={openPanel}
        onMouseLeave={scheduleClose}
        className={groupBtnCls(anyChildActive || open)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Icon
          size={15}
          strokeWidth={1.75}
          className="flex-shrink-0"
          aria-hidden="true"
        />
        <span className="flex-1">{group.title}</span>
        <ChevronRight
          size={13}
          strokeWidth={1.75}
          className="flex-shrink-0 text-muted"
          aria-hidden="true"
        />
      </button>
      {open &&
        createPortal(
          <div
            ref={panelRef}
            role="menu"
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            className="fixed z-[60] w-[210px] rounded-[8px] border border-card bg-surface shadow-overlay animate-menu-enter"
            style={{
              left: coords.left,
              top: coords.top,
            }}
          >
            <div
              ref={scrollRef}
              className="overflow-y-auto p-2"
              style={{
                maxHeight: coords.maxHeight,
                maskImage: mask,
                WebkitMaskImage: mask,
                transition:
                  "mask-image 160ms ease, -webkit-mask-image 160ms ease",
              }}
            >
              <SectionLabel className="px-2 pb-1.5 block">
                {group.title}
              </SectionLabel>
              <div className="flex flex-col gap-0.5">
                {group.children.map((item) => (
                  <NavItemLink
                    key={item.url}
                    item={item}
                    isActive={isActive(item.url)}
                    onPanel
                  />
                ))}
              </div>
            </div>
            <EdgeIndicators edges={edges} />
          </div>,
          document.body,
        )}
    </div>
  );
}

const THEME_OPTIONS: {
  value: Theme;
  icon: React.ElementType;
  label: string;
}[] = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "Auto" },
  ];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { trackEvent, setTraits } = useRybbit();
  const containerRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState({ x: 0, width: 0, ready: false });

  function reportThemePreference(next: Theme) {
    trackEvent("user:preference:theme", { theme: next });
    setTraits({ theme: next });
  }

  useLayoutEffect(() => {
    function measure() {
      if (!containerRef.current) return;
      const buttons =
        containerRef.current.querySelectorAll<HTMLButtonElement>("button");
      const activeIndex = THEME_OPTIONS.findIndex((o) => o.value === theme);
      const btn = buttons[activeIndex];
      if (btn) {
        setPill((prev) => ({
          x: btn.offsetLeft,
          width: btn.offsetWidth,
          ready: prev.ready || true,
        }));
      }
    }

    measure();

    const observer = new ResizeObserver(measure);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [theme]);

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label="Color theme"
      data-tour="theme-toggle"
      className="relative flex items-center bg-[#dde0e2] dark:bg-[#1e2d3d] rounded-[6px] py-0.5 gap-0.5 overflow-hidden"
    >
      {/* Sliding active pill */}
      <div
        className="absolute top-0.5 bottom-0.5 left-0 rounded-[4px] bg-[#002b45]/8 dark:bg-slate-600 shadow-sm pointer-events-none"
        style={{
          width: pill.width || undefined,
          transform: `translateX(${pill.x}px)`,
          transition: pill.ready
            ? "transform 220ms cubic-bezier(0.16, 1, 0.3, 1)"
            : "none",
        }}
        aria-hidden="true"
      />
      {THEME_OPTIONS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          aria-label={label}
          aria-pressed={theme === value}
          onClick={() => {
            setTheme(value);
            reportThemePreference(value);
          }}
          className={cn(
            "relative flex flex-1 items-center justify-center gap-1 py-2.5 md:py-1 rounded-[4px] text-[0.625rem] font-mono transition-colors cursor-pointer border-0 bg-transparent z-10 outline-none focus-visible:ring-2 focus-visible:ring-action/50 focus-visible:ring-inset",
            theme === value
              ? "text-[#002b45] dark:text-white"
              : "text-muted hover:text-secondary",
          )}
        >
          <Icon size={11} strokeWidth={1.75} aria-hidden="true" />
          <span aria-hidden="true">{label}</span>
        </button>
      ))}
    </div>
  );
}

function FontScaleToggle() {
  const { factor, setFactor } = useFontScale();
  const { trackEvent, setTraits } = useRybbit();
  const containerRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState({ x: 0, width: 0, ready: false });
  const [customInput, setCustomInput] = useState(() =>
    String(Math.round(factor * 100)),
  );

  const activePresetIndex = FONT_SCALE_PRESETS.findIndex(
    (p) => Math.abs(p.factor - factor) < 0.0005,
  );

  function reportPreference(nextFactor: number) {
    const matchesPreset = FONT_SCALE_PRESETS.some(
      (p) => Math.abs(p.factor - nextFactor) < 0.0005,
    );
    trackEvent("user:preference:ui-size", {
      ratio: nextFactor,
      custom: !matchesPreset,
    });
    setTraits({ uiSize: nextFactor });
  }

  useEffect(() => {
    setCustomInput(String(Math.round(factor * 100)));
  }, [factor]);

  useLayoutEffect(() => {
    function measure() {
      if (!containerRef.current) return;
      if (activePresetIndex === -1) {
        setPill((prev) => ({ ...prev, width: 0 }));
        return;
      }
      const buttons =
        containerRef.current.querySelectorAll<HTMLButtonElement>("button");
      const btn = buttons[activePresetIndex];
      if (btn) {
        setPill((prev) => ({
          x: btn.offsetLeft,
          width: btn.offsetWidth,
          ready: prev.ready || true,
        }));
      }
    }

    measure();

    const observer = new ResizeObserver(measure);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [activePresetIndex]);

  function applyLive(raw: string) {
    setCustomInput(raw);
    const n = parseFloat(raw);
    if (!Number.isFinite(n)) return;
    const pct = n;
    if (pct < FONT_SCALE_MIN * 100 || pct > FONT_SCALE_MAX * 100) return;
    setFactor(pct / 100);
  }

  function commitCustom(raw: string) {
    const n = parseFloat(raw);
    if (Number.isFinite(n)) {
      const clamped = Math.min(
        FONT_SCALE_MAX,
        Math.max(FONT_SCALE_MIN, n / 100),
      );
      setFactor(clamped);
      reportPreference(clamped);
    } else {
      setCustomInput(String(Math.round(factor * 100)));
    }
  }

  const minPct = Math.round(FONT_SCALE_MIN * 100);
  const maxPct = Math.round(FONT_SCALE_MAX * 100);

  return (
    <div>
      <div
        ref={containerRef}
        role="group"
        aria-label="Font size"
        data-tour="font-scale-toggle"
        className="relative flex items-center bg-[#dde0e2] dark:bg-[#1e2d3d] rounded-[6px] py-0.5 gap-0.5 overflow-hidden"
      >
        {/* Sliding active pill */}
        <div
          className="absolute top-0.5 bottom-0.5 left-0 rounded-[4px] bg-[#002b45]/8 dark:bg-slate-600 shadow-sm pointer-events-none"
          style={{
            width: pill.width || undefined,
            opacity: activePresetIndex === -1 ? 0 : 1,
            transform: `translateX(${pill.x}px)`,
            transition: pill.ready
              ? "transform 220ms cubic-bezier(0.16, 1, 0.3, 1), opacity 160ms ease"
              : "none",
          }}
          aria-hidden="true"
        />
        {FONT_SCALE_PRESETS.map(({ label, factor: presetFactor }, i) => {
          const isActive = i === activePresetIndex;
          return (
            <button
              key={label}
              type="button"
              aria-label={label}
              aria-pressed={isActive}
              onClick={() => {
                setFactor(presetFactor);
                reportPreference(presetFactor);
              }}
              className={cn(
                "relative flex flex-1 items-center justify-center gap-1 py-2.5 md:py-1 rounded-[4px] text-[0.625rem] font-mono transition-colors cursor-pointer border-0 bg-transparent z-10 outline-none focus-visible:ring-2 focus-visible:ring-action/50 focus-visible:ring-inset",
                isActive
                  ? "text-[#002b45] dark:text-white"
                  : "text-muted hover:text-secondary",
              )}
            >
              <span aria-hidden="true">{label}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <label
          htmlFor="ssu-font-scale-custom"
          className="text-[0.625rem] font-mono uppercase tracking-wider text-muted"
        >
          Custom
        </label>
        <div className="relative flex-1">
          <input
            id="ssu-font-scale-custom"
            type="number"
            inputMode="numeric"
            min={minPct}
            max={maxPct}
            step={5}
            value={customInput}
            onChange={(e) => applyLive(e.target.value)}
            onBlur={(e) => commitCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                commitCustom((e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).blur();
              }
            }}
            className="w-full pl-2 pr-5 py-1 text-[0.6875rem] font-mono bg-surface border border-card rounded-[4px] text-primary outline-none focus:ring-2 focus:ring-action/50"
          />
          <span
            aria-hidden="true"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[0.625rem] text-muted pointer-events-none"
          >
            %
          </span>
        </div>
      </div>
    </div>
  );
}

function UserMenu({
  user,
}: {
  user: { name?: string; title?: string; profilePictureUrl?: string } | null;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { trackEvent } = useRybbit();

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
    trackEvent("auth:session:signed-out");
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
        <div className="absolute bottom-full left-3 right-3 mb-1.5 z-20 rounded-[8px] border border-card bg-surface shadow-overlay overflow-hidden animate-menu-enter">
          <div data-tour="ui-size-section" className="px-3 py-3">
            <div className="flex items-center gap-1 mb-2">
              <span className="text-[0.625rem] font-mono uppercase tracking-wider text-muted">
                UI size
              </span>
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label="UI size help"
                      className="inline-flex items-center justify-center text-muted hover:text-secondary transition-colors cursor-help border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-action/50 rounded-full"
                    >
                      <Info size={11} strokeWidth={1.75} aria-hidden="true" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="start"
                    className="max-w-[240px] text-[0.6875rem] leading-snug"
                  >
                    UI scaling is only tested at M, using it at any other size
                    is likely to introduce weird UI behaviour and bugs.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <FontScaleToggle />
          </div>
          <div className="h-px bg-[#eeeeee] dark:bg-[#1e2d3d]" />
          <button
            type="button"
            onClick={() => {
              refreshSession();
              setOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-3 text-[0.75rem] text-primary hover:bg-[#f2f2f2] dark:hover:bg-[#334155] cursor-pointer border-0 bg-transparent text-left transition-colors"
          >
            <RefreshCw
              size={13}
              strokeWidth={1.75}
              className="flex-shrink-0 text-action"
            />
            Refresh session
          </button>
          <div className="h-px bg-[#eeeeee] dark:bg-[#1e2d3d]" />
          <button
            type="button"
            onClick={() => {
              signOut();
              setOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-3 text-[0.75rem] text-[#be1e2d] hover:bg-[#f2f2f2] dark:hover:bg-[#334155] cursor-pointer border-0 bg-transparent text-left transition-colors"
          >
            <LogOut size={13} strokeWidth={1.75} className="flex-shrink-0" />
            Sign out
          </button>
        </div>
      )}

      <button
        type="button"
        data-tour="user-menu-trigger"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center gap-2.5 px-5 pt-2 pb-5 cursor-pointer border-0 bg-transparent text-left transition-colors",
          open
            ? "bg-white dark:bg-slate-700/60"
            : "hover:bg-white dark:hover:bg-slate-700/60",
        )}
      >
        <UserAvatar
          name={user?.name}
          pictureUrl={user?.profilePictureUrl}
          size="lg"
          className="dark:bg-slate-600"
        />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[0.75rem] font-medium text-primary truncate">
            {user?.name ?? ""}
          </span>
          <span className="text-[0.6875rem] text-muted truncate">
            {user?.title ?? ""}
          </span>
        </div>
        <ChevronUp
          size={13}
          strokeWidth={1.75}
          className={cn(
            "flex-shrink-0 text-muted transition-transform duration-200 ease-out-expo",
            open ? "rotate-180" : "",
          )}
        />
      </button>
    </div>
  );
}

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const isMobile = useIsMobile();
  const { user } = useContext(AppContext);
  const { isCloudEngineerEnabled, setIsCloudEngineerEnabled } =
    useContext(PreAppContext);
  const location = useLocation();

  const navRef = useRef<HTMLElement>(null);
  const navEdges = useScrollEdges(navRef);
  const navMask = edgeMask(navEdges);

  const isCloudEngineer = useMemo(
    () => checkIfCloudEngineer(user?.roles ?? []),
    [user?.roles],
  );

  // Reconcile CE mode with the user's actual role once /me has loaded. This
  // both enables it for cloud engineers and clears any stale persisted value
  // for users who aren't (e.g. lost the role since last visit).
  useEffect(() => {
    if (user?.isAuthenticated) {
      setIsCloudEngineerEnabled(isCloudEngineer);
    }
  }, [isCloudEngineer, user?.isAuthenticated]);

  function isActive(url: string): boolean {
    if (url === "/") return location.pathname === "/";
    if (location.pathname === url) return true;
    if (location.pathname.startsWith(url + "/")) {
      // Don't match prefix if a more-specific nav item matches
      const allNavItems = [
        ...platformNav,
        ...contentNav,
        ...ceNav,
        ...costCentresGroup.children,
      ];
      const hasMoreSpecificMatch = allNavItems.some(
        (item) => item.url !== url && location.pathname.startsWith(item.url),
      );
      return !hasMoreSpecificMatch;
    }
    return false;
  }

  // Desktop opens groups in a floating flyout; mobile uses the inline
  // accordion inside the full-height drawer.
  function renderGroup(group: NavGroupDef) {
    return isMobile ? (
      <NavGroupAccordion key={group.title} group={group} isActive={isActive} />
    ) : (
      <NavGroupFlyout key={group.title} group={group} isActive={isActive} />
    );
  }

  const mainSections = (
    <>
      {/* PLATFORM */}
      <div>
        <SectionLabel className="px-3 pb-1.5 block">Platform</SectionLabel>
        <div className="flex flex-col gap-1 md:gap-0.5">
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
          {renderGroup(costCentresGroup)}
          {isCloudEngineerEnabled && renderGroup(adminNav)}
        </div>
      </div>

      {/* CONTENT */}
      <div>
        <SectionLabel className="px-3 pb-1.5 block">Content</SectionLabel>
        <div className="flex flex-col gap-1 md:gap-0.5">
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
        <SectionLabel className="px-3 pb-1.5 block">External</SectionLabel>
        <div className="flex flex-col gap-1 md:gap-0.5">
          {externalNav.map((item) => (
            <NavItemLink
              key={item.url}
              item={item}
              isActive={isActive(item.url)}
            />
          ))}
        </div>
      </div>
    </>
  );

  return (
    <aside
      className={cn(
        "w-4/5 md:w-[220px] flex-shrink-0 flex flex-col bg-surface-subtle border-r border-card overflow-hidden",
        // Mobile: fixed overlay drawer
        "fixed inset-y-0 left-0 z-50",
        // Desktop: sticky in-flow sidebar
        "md:sticky md:top-0 md:bottom-auto md:h-[var(--ssu-vh)] md:z-20",
      )}
      style={
        isMobile
          ? {
            transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 500ms cubic-bezier(0.16, 1, 0.3, 1)",
          }
          : undefined
      }
    >
      {/* Mobile close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-1.5 right-1.5 md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-[6px] text-secondary hover:bg-white dark:hover:bg-slate-700 border-0 bg-transparent cursor-pointer"
        aria-label="Close navigation"
      >
        <X size={16} strokeWidth={1.75} />
      </button>

      {/* Logo */}
      <Link
        to="/"
        className="flex items-center gap-2.5 px-4 h-[52px] border-b border-card no-underline flex-shrink-0"
        aria-label="DFDS Self Service home"
      >
        <DfdsHexMark className="h-7 w-auto text-primary flex-shrink-0" />
        <div className="flex flex-col leading-tight">
          <span className="text-[0.5625rem] font-semibold tracking-[0.08em] uppercase text-muted font-mono">
            DFDS
          </span>
          <span className="text-[0.75rem] font-bold text-primary leading-none font-mono">
            Self Service
          </span>
        </div>
      </Link>

      {/* Nav */}
      <div className="relative flex-1 min-h-0">
        <nav
          ref={navRef}
          id="sidebar-nav"
          aria-label="Main navigation"
          className="h-full px-3 py-4 flex flex-col gap-5 overflow-y-auto"
          style={{
            maskImage: navMask,
            WebkitMaskImage: navMask,
            transition: "mask-image 160ms ease, -webkit-mask-image 160ms ease",
          }}
        >
          {mainSections}
        </nav>
        {/* Scroll-overflow chevron indicators */}
        <EdgeIndicators edges={navEdges} />
      </div>

      {/* Commit hash */}
      {process.env.REACT_APP_COMMIT_HASH && (
        <div className="pb-2 text-[0.625rem] font-mono text-[#c4c8cc] dark:text-[#3d4f63] select-none text-center">
          {process.env.REACT_APP_COMMIT_HASH}
        </div>
      )}

      {/* Footer */}
      <div className="px-3 py-3 border-t border-card flex-shrink-0 flex flex-col gap-2">
        {/* Mobile-only: What's New + CE Mode (hidden in TopBar on small screens) */}
        {isMobile && (
          <div className="flex items-center justify-between gap-2">
            {/* Close the drawer when the bell is tapped — the list modal opens on top of the page, the sidebar shouldn't linger. */}
            <div onClick={onClose}>
              <WhatsNewBell />
            </div>
            {isCloudEngineer && (
              <div className="flex items-center gap-2 select-none">
                <span
                  id="ce-mode-label-mobile"
                  className="text-[0.625rem] font-semibold tracking-[0.08em] uppercase text-muted font-mono"
                >
                  CE Mode
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isCloudEngineerEnabled}
                  aria-labelledby="ce-mode-label-mobile"
                  onClick={() =>
                    setIsCloudEngineerEnabled((prev: boolean) => !prev)
                  }
                  className={`relative inline-flex h-5 w-9 rounded-full overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#002b45] cursor-pointer before:content-[''] before:absolute before:-inset-[10px] [transition:background-color_200ms_50ms_cubic-bezier(0.16,1,0.3,1)] ${isCloudEngineerEnabled
                    ? "bg-[#1b63c1]"
                    : "bg-[#d9dcde] dark:bg-[#334155]"
                    }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm z-10 [transition:translate_200ms_cubic-bezier(0.16,1,0.3,1)] ${isCloudEngineerEnabled
                      ? "translate-x-4 animate-switch-slider-on"
                      : "translate-x-0.5 animate-switch-slider-off"
                      }`}
                  />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Profile */}
        <UserMenu user={user} />
      </div>
    </aside>
  );
}
