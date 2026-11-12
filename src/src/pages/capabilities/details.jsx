import React, { useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { ChevronUp, Star } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import SelectedCapabilityContext from "./SelectedCapabilityContext";
import {
  useAddCapabilityFavourite,
  useRemoveCapabilityFavourite,
} from "@/state/remote/queries/capabilities";
import { TabbedMembersView } from "./members";
import Summary from "./summary";
import Costs from "./costs";
import AwsResources from "./resources/aws";
import AzureResources from "./resources/azure";
import Deployments from "./resources/deployments";
import KafkaCluster from "./KafkaCluster";
import PageSection, { TabbedPageSection } from "@/components/PageSection";
import { Text } from "@/components/ui/Text";
import {
  SkeletonCapabilityHeader,
  SkeletonCapabilitySummary,
} from "@/components/ui/skeleton";
import { SelectedCapabilityProvider } from "./SelectedCapabilityContext";
import DeletionWarning from "./deletionWarning";
import CapabilityManagement from "./capabilityManagement";
import { CapabilityTagsPageSection } from "./capabilityTags";
import { AICatalogueSection } from "./aiCatalogue";
import RequirementsScore from "./RequirementsStatus";
import NotFound from "@/components/Page/NotFound";

export default function CapabilityDetailsPage() {
  return (
    <SelectedCapabilityProvider>
      <CapabilityDetailsPageContent />
    </SelectedCapabilityProvider>
  );
}

// Input that can scroll the page. Re-aligning stops on any of them, so the page
// never scrolls under the user, and only scrolling after one updates the hash.
const USER_SCROLL_EVENTS = ["wheel", "touchstart", "keydown", "mousedown"];

/**
 * Scrolls to the section the URL hash names once `ready`. The sections render
 * only after the capability loads, so the browser's own jump on page load
 * finds no target; sections above it then grow as their own queries resolve,
 * so the jump repeats on layout changes for up to 2 s. A hash the page wrote
 * itself while the user scrolled (`syncedHashRef`) is skipped.
 */
function useScrollToHash(hash, ready, syncedHashRef) {
  useEffect(() => {
    if (!ready || !hash || hash === syncedHashRef.current) return;
    const id = decodeURIComponent(hash.slice(1));
    const align = () => document.getElementById(id)?.scrollIntoView();
    align();
    const observer = new ResizeObserver(align);
    observer.observe(document.body);
    const timer = setTimeout(stop, 2000);
    function stop() {
      observer.disconnect();
      clearTimeout(timer);
      for (const e of USER_SCROLL_EVENTS) window.removeEventListener(e, stop);
    }
    for (const e of USER_SCROLL_EVENTS) {
      window.addEventListener(e, stop, { passive: true });
    }
    return stop;
  }, [hash, ready, syncedHashRef]);
}

function CapabilityDetailsPageContent() {
  const { id } = useParams();
  const location = useLocation();
  const { hash } = location;
  const navigate = useNavigate();
  const {
    links,
    isLoading,
    isFound,
    name,
    details,
    kafkaClusters,
    loadCapability,
    showCosts,
    isPendingDeletion,
    isDeleted,
    updateDeletionStatus,
    awsAccount,
    metadata,
  } = useContext(SelectedCapabilityContext);

  const queryClient = useQueryClient();
  const addFavourite = useAddCapabilityFavourite();
  const removeFavourite = useRemoveCapabilityFavourite();

  const isFavourite = details?.isFavourite === true;

  const handleFavouriteToggle = () => {
    const mutation = isFavourite ? removeFavourite : addFavourite;
    mutation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["capabilities", "list"] });
          queryClient.invalidateQueries({
            queryKey: ["capabilities", "details", id],
          });
          queryClient.invalidateQueries({ queryKey: ["me"] });
        },
      },
    );
  };

  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
    loadCapability(id);
  }, [id]);

  // The hash follows the section at the top only for scrolling the user does.
  // A nav-link jump clears the flag: a section near the page end can't reach
  // the top, and the hash would move to the one above it.
  const userScrolledRef = useRef(false);
  const syncedHashRef = useRef(null);
  const locationRef = useRef(location);
  locationRef.current = location;

  useEffect(() => {
    const mark = () => {
      userScrolledRef.current = true;
    };
    for (const e of USER_SCROLL_EVENTS) {
      window.addEventListener(e, mark, { passive: true });
    }
    return () => {
      for (const e of USER_SCROLL_EVENTS) window.removeEventListener(e, mark);
    };
  }, []);

  const onNavLinkClick = () => {
    userScrolledRef.current = false;
    syncedHashRef.current = null;
  };

  useScrollToHash(hash, !isLoading && isFound, syncedHashRef);

  const pagetitle = isDeleted ? `${name} [Deleted]` : name;

  const [showJsonMetadata, setShowJsonMetadata] = useState(false);
  const [showAICatalogueSection, setShowAICatalogueSection] = useState(false);
  const [costCentre, setCostCentre] = useState("");

  useEffect(() => {
    if (metadata && metadata !== "{}") {
      const parsedMetadata = JSON.parse(metadata);
      const aiUsage = parsedMetadata["dfds.capability.contains-ai"];
      if (aiUsage === "true" || aiUsage === true) {
        setShowAICatalogueSection(true);
      } else {
        setShowAICatalogueSection(false);
      }
    }
  }, [metadata]);

  useEffect(() => {
    if ((links?.metadata?.allow || []).includes("GET")) {
      setShowJsonMetadata(true);
    }
  }, [links]);

  useEffect(() => {
    if (metadata && metadata !== "{}") {
      const parsedMetadata = JSON.parse(metadata);
      setCostCentre(parsedMetadata["dfds.cost.centre"]);
    }
  }, [metadata]);

  // GET awsaccount needs aws/read, which non-members lack, so awsAccount stays null for them
  // even when the capability has one. Topics prove the capability is set up for Kafka.
  const showKafkaClusters =
    !!awsAccount ||
    (kafkaClusters || []).some((cluster) => (cluster.topics || []).length > 0);

  const anchorLinks = [
    { href: "#summary", label: "Summary" },
    { href: "#members", label: "Members" },
    { href: "#requirements-status", label: "Requirements" },
    ...(showJsonMetadata ? [{ href: "#tags", label: "Tags" }] : []),
    ...(showAICatalogueSection
      ? [{ href: "#ai-catalogue", label: "AI Catalogue" }]
      : []),
    { href: "#aws-resources", label: "AWS & Kubernetes" },
    { href: "#azure-resources", label: "Azure" },
    { href: "#services", label: "Services" },
    { href: "#kafka", label: "Kafka" },
    ...(showCosts && awsAccount ? [{ href: "#costs", label: "Costs" }] : []),
    ...(!isDeleted ? [{ href: "#management", label: "Management" }] : []),
  ];

  const [activeSection, setActiveSection] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const activeLabel = anchorLinks.find(
    ({ href }) => href === activeSection,
  )?.label;

  // Close expanded mobile nav on scroll
  useEffect(() => {
    if (!mobileNavOpen) return;
    const close = () => setMobileNavOpen(false);
    window.addEventListener("scroll", close, { passive: true, once: true });
    return () => window.removeEventListener("scroll", close);
  }, [mobileNavOpen]);

  useEffect(() => {
    const sectionIds = anchorLinks.map(({ href }) => href.slice(1));

    const updateActive = () => {
      const HEADER_OFFSET = 80;
      let activeId = null;
      let rendered = false;

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        rendered = true;
        if (el.getBoundingClientRect().top <= HEADER_OFFSET) {
          activeId = id;
        }
      }

      const next = activeId ? "#" + activeId : "";
      setActiveSection(next || null);

      if (!rendered || !userScrolledRef.current) return;
      // window.location is current right after a replace; the router's
      // location only after the re-render.
      if (next === window.location.hash) return;
      syncedHashRef.current = next;
      const { pathname, search } = locationRef.current;
      navigate(
        { pathname, search, hash: next },
        { replace: true, preventScrollReset: true },
      );
    };

    window.addEventListener("scroll", updateActive, { passive: true });
    updateActive();

    return () => window.removeEventListener("scroll", updateActive);
  }, [
    showJsonMetadata,
    showAICatalogueSection,
    showCosts,
    awsAccount,
    isDeleted,
  ]);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-8 pb-16">
        <SkeletonCapabilityHeader />
        <div className="border border-[#d9dcde] dark:border-[#334155] rounded-[5px] p-4 mt-2">
          <SkeletonCapabilitySummary />
        </div>
      </div>
    );
  }

  if (!isFound) {
    return <NotFound />;
  }

  return (
    <div className="p-4 sm:p-8 pb-16 sm:pb-16 md:pb-8">
      <DeletionWarning
        deletionState={isPendingDeletion}
        updateDeletionState={updateDeletionStatus}
      />

      <div className="mb-6 animate-fade-up">
        <Link
          to="/capabilities"
          className="inline-flex items-center font-mono text-[0.6875rem] text-[#afafaf] dark:text-slate-500 tracking-[0.04em] no-underline hover:text-[#0e7cc1] dark:hover:text-[#60a5fa] mb-3 transition-colors"
        >
          ← Capabilities
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleFavouriteToggle}
            disabled={addFavourite.isPending || removeFavourite.isPending}
            className={`p-1 rounded transition-colors disabled:opacity-50 ${
              isFavourite
                ? "text-amber-500 hover:text-amber-600"
                : "text-muted hover:text-amber-500"
            }`}
            aria-label={
              isFavourite ? "Remove from favourites" : "Add to favourites"
            }
            title={
              isFavourite
                ? "Favourite capability. Click to remove it from your favourites. Favourites appear first in capability lists and on the front page."
                : "Mark as favourite. Favourites appear first in capability lists and on the front page."
            }
          >
            <Star
              size={20}
              className={isFavourite ? "fill-current" : "fill-none"}
            />
          </button>
          <h1 className="text-[1.625rem] font-bold text-[#002b45] dark:text-[#e2e8f0] font-mono tracking-[-0.02em]">
            {pagetitle}
          </h1>
        </div>
      </div>

      <div className="grid gap-8 items-stretch md:grid-cols-[1fr_180px]">
        {/* Left: content sections */}
        <div className="min-w-0">
          <div
            className="animate-section-enter"
            style={{ animationDelay: "60ms" }}
          >
            <Summary anchorId="summary" />
          </div>

          <div
            className="animate-section-enter"
            style={{ animationDelay: "130ms" }}
          >
            <TabbedMembersView anchorId="members" />
          </div>

          <div
            className="animate-section-enter"
            style={{ animationDelay: "200ms" }}
          >
            <RequirementsScore />
          </div>

          {showJsonMetadata && (
            <div
              className="animate-section-enter"
              style={{ animationDelay: "270ms" }}
            >
              <CapabilityTagsPageSection anchorId="tags" />
            </div>
          )}

          {showAICatalogueSection && (
            <div
              className="animate-section-enter"
              style={{ animationDelay: "270ms" }}
            >
              <AICatalogueSection anchorId="ai-catalogue" />
            </div>
          )}

          <div
            className="animate-section-enter"
            style={{ animationDelay: "270ms" }}
          >
            <AwsResources anchorId="aws-resources" />
          </div>

          <div
            className="animate-section-enter"
            style={{ animationDelay: "300ms" }}
          >
            <AzureResources anchorId="azure-resources" />
          </div>

          <div
            className="animate-section-enter"
            style={{ animationDelay: "320ms" }}
          >
            <Deployments anchorId="services" />
          </div>

          <div
            className="animate-section-enter"
            style={{ animationDelay: "340ms" }}
          >
            {showKafkaClusters && (kafkaClusters || []).length > 1 ? (
              <TabbedPageSection
                id="kafka"
                headline="Kafka Clusters"
                tabs={Object.fromEntries(
                  (kafkaClusters || []).map((cluster, i) => [
                    String(i),
                    `${cluster.name} (${(cluster.topics || []).length})`,
                  ]),
                )}
                tabsContent={Object.fromEntries(
                  (kafkaClusters || []).map((cluster, i) => [
                    String(i),
                    <KafkaCluster
                      key={cluster.id}
                      cluster={cluster}
                      capabilityId={id}
                    />,
                  ]),
                )}
              />
            ) : (
              <PageSection id="kafka" headline="Kafka Clusters">
                {!showKafkaClusters && (
                  <Text>
                    No AWS account is linked to this capability. Please link an
                    AWS account to view Kafka clusters.
                  </Text>
                )}
                {showKafkaClusters &&
                  (kafkaClusters || []).map((cluster) => (
                    <KafkaCluster
                      key={cluster.id}
                      cluster={cluster}
                      capabilityId={id}
                    />
                  ))}
              </PageSection>
            )}
          </div>

          {showCosts && (
            <div
              className="animate-section-enter"
              style={{ animationDelay: "400ms" }}
            >
              <Costs anchorId="costs" costCentre={costCentre} />
            </div>
          )}

          {!isDeleted && (
            <div
              className="animate-section-enter"
              style={{ animationDelay: "460ms" }}
            >
              <CapabilityManagement
                anchorId="management"
                deletionState={isPendingDeletion}
                updateDeletionState={updateDeletionStatus}
              />
            </div>
          )}
        </div>

        {/* Right: sticky anchor nav - desktop only */}
        <div
          className="hidden md:block animate-fade-up"
          style={{ animationDelay: "100ms" }}
        >
          <div className="sticky top-[68px] bg-white dark:bg-[#1e293b] border border-[#d9dcde] dark:border-[#334155] rounded-[8px] overflow-hidden">
            <div className="font-mono text-[0.5625rem] font-semibold tracking-[0.1em] uppercase text-[#afafaf] dark:text-slate-500 px-4 py-3 border-b border-[#eeeeee] dark:border-[#1e2d3d]">
              On this page
            </div>
            {anchorLinks.map(({ href, label }) => {
              const isActive = activeSection === href;
              return (
                <a
                  key={href}
                  href={href}
                  onClick={onNavLinkClick}
                  className={`block pl-3.5 pr-4 py-[0.3rem] font-mono text-[0.6875rem] no-underline tracking-[0.03em] transition-colors border-l-2 ${
                    isActive
                      ? "text-[#0e7cc1] dark:text-[#60a5fa] border-[#0e7cc1] dark:border-[#60a5fa]"
                      : "text-[#666666] dark:text-slate-400 hover:text-[#0e7cc1] dark:hover:text-[#60a5fa] hover:bg-[#f2f2f2] dark:hover:bg-slate-700 border-transparent"
                  }`}
                >
                  {label}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile: fixed bottom nav bar - md:hidden */}
      {createPortal(
        <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white dark:bg-[#1e293b] border-t border-[#d9dcde] dark:border-[#334155] shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
          {/* Expandable link list */}
          <div
            className="grid transition-[grid-template-rows] duration-200 ease-in-out"
            style={{ gridTemplateRows: mobileNavOpen ? "1fr" : "0fr" }}
          >
            <div className="overflow-hidden">
              <div className="border-b border-[#d9dcde] dark:border-[#334155] overflow-y-auto max-h-80">
                {anchorLinks.map(({ href, label }) => {
                  const isActive = activeSection === href;
                  return (
                    <a
                      key={href}
                      href={href}
                      onClick={() => {
                        onNavLinkClick();
                        setMobileNavOpen(false);
                      }}
                      className={cn(
                        "flex items-center px-4 py-3 font-mono text-[0.75rem] no-underline tracking-[0.03em] transition-colors border-l-2",
                        isActive
                          ? "text-[#0e7cc1] dark:text-[#60a5fa] border-[#0e7cc1] dark:border-[#60a5fa] bg-[#f0f9ff] dark:bg-[#0e7cc1]/10"
                          : "text-[#666666] dark:text-slate-400 border-transparent hover:bg-[#f2f2f2] dark:hover:bg-slate-700",
                      )}
                    >
                      {label}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Collapsed bar - always visible trigger */}
          <button
            type="button"
            onClick={() => setMobileNavOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 h-12 cursor-pointer border-0 bg-transparent text-left"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-[0.5625rem] font-semibold tracking-[0.1em] uppercase text-[#afafaf] dark:text-slate-500 flex-shrink-0">
                On this page
              </span>
              {activeLabel && (
                <>
                  <span className="text-[#d9dcde] dark:text-[#334155] flex-shrink-0">
                    ·
                  </span>
                  <span className="font-mono text-[0.75rem] font-medium text-[#0e7cc1] dark:text-[#60a5fa] truncate">
                    {activeLabel}
                  </span>
                </>
              )}
            </div>
            <ChevronUp
              size={14}
              strokeWidth={1.75}
              className={cn(
                "flex-shrink-0 ml-2 text-[#afafaf] dark:text-slate-500 transition-transform duration-200",
                mobileNavOpen ? "rotate-0" : "rotate-180",
              )}
            />
          </button>
        </div>,
        document.body,
      )}
    </div>
  );
}
