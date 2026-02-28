import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import SelectedCapabilityContext from "./SelectedCapabilityContext";
import { TabbedMembersView } from "./members";
import Summary from "./summary";
import Costs from "./costs";
import Resources from "./resources";
import KafkaCluster from "./KafkaCluster";
import PageSection from "components/PageSection";
import { Text } from "@/components/ui/Text";
import { Spinner } from "@/components/ui/spinner";
import { SelectedCapabilityProvider } from "./SelectedCapabilityContext";
import DeletionWarning from "./deletionWarning";
import CapabilityManagement from "./capabilityManagement";
import { CapabilityTagsPageSection } from "./capabilityTags";
import { AICatalogueSection } from "./aiCatalogue";
import RequirementsScore from "./RequirementsStatus";
import NotFound from "components/Page/NotFound";

export default function CapabilityDetailsPage() {
  return (
    <SelectedCapabilityProvider>
      <CapabilityDetailsPageContent />
    </SelectedCapabilityProvider>
  );
}

function CapabilityDetailsPageContent() {
  const { id } = useParams();
  const {
    links,
    isLoading,
    isFound,
    name,
    kafkaClusters,
    loadCapability,
    showCosts,
    isPendingDeletion,
    isDeleted,
    updateDeletionStatus,
    awsAccount,
    metadata,
  } = useContext(SelectedCapabilityContext);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadCapability(id);
  }, [id]);

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

  const anchorLinks = [
    { href: "#summary", label: "Summary" },
    { href: "#requirements-status", label: "Requirements" },
    { href: "#members", label: "Members" },
    ...(showJsonMetadata ? [{ href: "#tags", label: "Tags" }] : []),
    ...(showAICatalogueSection ? [{ href: "#ai-catalogue", label: "AI Catalogue" }] : []),
    { href: "#resources", label: "Resources" },
    { href: "#kafka", label: "Kafka" },
    ...(showCosts && awsAccount ? [{ href: "#costs", label: "Costs" }] : []),
    ...(!isDeleted ? [{ href: "#management", label: "Management" }] : []),
  ];

  const [activeSection, setActiveSection] = useState(null);
  const visibleSections = useRef(new Set());

  useEffect(() => {
    const sectionIds = anchorLinks.map(({ href }) => href.slice(1));
    const observers = [];

    const updateActive = () => {
      for (const id of sectionIds) {
        if (visibleSections.current.has(id)) {
          setActiveSection("#" + id);
          return;
        }
      }
    };

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            visibleSections.current.add(id);
          } else {
            visibleSections.current.delete(id);
          }
          updateActive();
        },
        { rootMargin: "-52px 0px -50% 0px", threshold: 0 },
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((o) => o.disconnect());
      visibleSections.current.clear();
    };
  }, [showJsonMetadata, showAICatalogueSection, showCosts, awsAccount, isDeleted]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isFound) {
    return <NotFound />;
  }

  return (
    <div className="p-8">
      <DeletionWarning
        deletionState={isPendingDeletion}
        updateDeletionState={updateDeletionStatus}
      />

      <div className="mb-6">
        <Link
          to="/capabilities"
          className="inline-flex items-center font-mono text-[11px] text-[#afafaf] dark:text-slate-500 tracking-[0.04em] no-underline hover:text-[#0e7cc1] dark:hover:text-[#60a5fa] mb-3 transition-colors"
        >
          ← Capabilities
        </Link>
        <h1 className="text-[1.625rem] font-bold text-[#002b45] dark:text-[#e2e8f0] font-mono tracking-[-0.02em]">
          {pagetitle}
        </h1>
      </div>

      <div
        className="grid gap-8 items-stretch"
        style={{ gridTemplateColumns: "1fr 180px" }}
      >
        {/* Left: content sections */}
        <div className="min-w-0">
          <Summary anchorId="summary" />

          <RequirementsScore />

          <TabbedMembersView anchorId="members" />

          {showJsonMetadata && <CapabilityTagsPageSection anchorId="tags" />}

          {showAICatalogueSection && (
            <AICatalogueSection anchorId="ai-catalogue" />
          )}

          <Resources anchorId="resources" capabilityId={id} />

          {!awsAccount && (
            <PageSection id="kafka" headline="Kafka Clusters">
              <Text>
                No AWS account is linked to this capability. Please link an AWS
                account to view Kafka clusters.
              </Text>
            </PageSection>
          )}
          <section id="kafka">
            {awsAccount !== undefined &&
              awsAccount &&
              (kafkaClusters || []).map((cluster) => (
                <KafkaCluster
                  key={cluster.id}
                  cluster={cluster}
                  capabilityId={id}
                />
              ))}
          </section>

          {showCosts && awsAccount !== undefined && (
            <Costs anchorId="costs" costCentre={costCentre} />
          )}

          {!isDeleted && (
            <CapabilityManagement
              anchorId="management"
              deletionState={isPendingDeletion}
              updateDeletionState={updateDeletionStatus}
            />
          )}
        </div>

        {/* Right: sticky anchor nav */}
        <div>
          <div className="sticky top-[68px] bg-white dark:bg-[#1e293b] border border-[#d9dcde] dark:border-[#334155] rounded-[8px] overflow-hidden">
            <div className="font-mono text-[9px] font-semibold tracking-[0.1em] uppercase text-[#afafaf] dark:text-slate-500 px-4 py-3 border-b border-[#eeeeee] dark:border-[#1e2d3d]">
              On this page
            </div>
            {anchorLinks.map(({ href, label }) => {
              const isActive = activeSection === href;
              return (
                <a
                  key={href}
                  href={href}
                  className={`block pl-3.5 pr-4 py-[0.3rem] font-mono text-[11px] no-underline tracking-[0.03em] transition-colors border-l-2 ${
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
    </div>
  );
}
