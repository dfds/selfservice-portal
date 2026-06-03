import AppContext from "@/AppContext";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import PageSection from "@/components/PageSection";
import LatestNews from "./LatestNews";
import QuickLinks from "./QuickLinks";
import MyCapabilities from "./MyCapabilities";
import PlatformStatus from "./PlatformStatus";
import MiniUpcomingEvents from "./MiniUpcomingEvents";
import MiniLatestNews from "./MiniLatestNews";
import { useRelevantNews } from "@/state/remote/queries/news";
import { TrackedLink } from "@/components/Tracking";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Separator } from "@/components/ui/separator";
import { Layers, List } from "lucide-react";

function HeroRow({ name }) {
  const firstName = name.split(" ")[0] || name;

  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-4">
      <div>
        <div className="font-mono text-[0.6875rem] font-semibold tracking-[0.15em] uppercase text-action mb-1.5">
          // Developer Portal
        </div>
        <h1 className="text-[1.75rem] font-bold text-primary font-mono tracking-[-0.02em] leading-[1.2] mb-1.5">
          Hello, {firstName}
        </h1>
        <div className="font-mono text-[0.75rem] text-muted tracking-[0.03em]">
          Welcome back
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:flex sm:w-auto sm:items-stretch flex-shrink-0">
        <MiniLatestNews />
        <MiniUpcomingEvents />
      </div>
    </div>
  );
}

function NavCard({ to, href, iconBg, icon, name, description, action }) {
  const stretchedLink = to ? (
    <Link
      to={to}
      className="absolute inset-0 rounded-[10px]"
      aria-label={name}
    />
  ) : (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="absolute inset-0 rounded-[10px]"
      aria-label={name}
    />
  );

  return (
    <div className="relative flex items-center gap-[0.875rem] bg-surface border border-card rounded-[10px] p-[1.125rem] mb-3 last:mb-0 transition-[box-shadow,transform] duration-200 ease-out-expo hover:shadow-[0_4px_12px_rgba(0,0,0,0.09)] hover:-translate-y-[2px]">
      {stretchedLink}
      <div
        className="w-[38px] h-[38px] rounded-[9px] flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[0.875rem] font-semibold text-primary mb-[3px]">
          {name}
        </div>
        <div className="text-[0.75rem] text-muted leading-[1.5]">
          {description}
        </div>
      </div>
      {action && <div className="relative z-10 flex-shrink-0">{action}</div>}
    </div>
  );
}

export default function FrontPage() {
  const { user } = useContext(AppContext);
  const name = user?.name ?? "there";
  const { data: newsData } = useRelevantNews();
  const highlighted =
    newsData?.newsItems?.filter((item) => item.isHighlighted) ?? [];

  return (
    <div className="p-4 sm:p-8">
      <HeroRow name={name} />

      {/* Highlighted notices from relevant news */}
      {highlighted.map((item, i) => (
        <div
          key={item.id}
          className="mb-[1.75rem] bg-[rgba(237,136,0,0.1)] dark:bg-[rgba(237,136,0,0.08)] border border-[rgba(237,136,0,0.25)] dark:border-[rgba(237,136,0,0.2)] rounded-[6px] px-4 py-3 font-mono text-[0.75rem] text-[#ed8800] leading-[1.6] animate-fade-up"
          style={{ animationDelay: `${40 + i * 40}ms` }}
        >
          <span className="font-bold tracking-[0.05em]">{item.title} — </span>
          {item.body ?? ""}
        </div>
      ))}

      {/* 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-5 items-start">
        {/* CENTER: My Capabilities + Platform nav cards — first in DOM so it appears at top on mobile */}
        <div
          className="animate-fade-up lg:order-2"
          style={{ animationDelay: "80ms" }}
        >
          <SectionLabel as="h2" className="mb-2 block">
            // my top actionable capabilities
          </SectionLabel>
          <PageSection>
            <MyCapabilities />
          </PageSection>

          <SectionLabel as="h2" className="mb-2 block">
            // platform
          </SectionLabel>
          <NavCard
            to="/capabilities"
            iconBg="#e8f4fb"
            icon={<Layers size={18} color="#0e7cc1" />}
            name="Capabilities"
            description="Create or join capabilities. Manage your team's cloud resources, AWS accounts, members, and onboarding steps."
            action={
              <Link
                to="/capabilities?new=true"
                className="inline-flex items-center h-[28px] px-2.5 bg-transparent text-secondary border border-card rounded-[5px] font-mono text-[0.6875rem] tracking-[0.04em] no-underline transition-colors hover:bg-surface-muted whitespace-nowrap"
              >
                + New Capability
              </Link>
            }
          />
          <NavCard
            to="/topics"
            iconBg="#ede9fe"
            icon={<List size={18} color="#6d28d9" />}
            name="Kafka Topics"
            description="Browse all platform topics. Building in .NET? Check out dafda — you're welcome!"
          />
          <NavCard
            href="https://wiki.dfds.cloud/en/playbooks/getting-started/journey"
            iconBg="#dcfce7"
            icon={<span className="text-[1.125rem] text-[#16a34a]">☸</span>}
            name="Kubernetes"
            description="First visit? Start with the Kubernetes Getting Started guide."
            action={
              <TrackedLink
                trackName="DownloadKubeConfig"
                href="https://dfds-oxygen-k8s-public.s3-eu-west-1.amazonaws.com/kubeconfig/hellman-saml.config"
                className="inline-flex items-center h-[28px] px-2.5 bg-transparent text-secondary border border-card rounded-[5px] font-mono text-[0.6875rem] tracking-[0.04em] no-underline transition-colors hover:bg-surface-muted whitespace-nowrap"
              >
                ↓ Download kubeconfig
              </TrackedLink>
            }
          />
          <NavCard
            to="/ecr"
            iconBg="#fef3c7"
            icon={<span className="text-[1.125rem] text-[#ed8800]">□</span>}
            name="ECR Repositories"
            description="Browse and manage your team's container image repositories across AWS accounts."
            action={
              <Link
                to="/ecr?new=true"
                className="inline-flex items-center h-[28px] px-2.5 bg-transparent text-secondary border border-card rounded-[5px] font-mono text-[0.6875rem] tracking-[0.04em] no-underline transition-colors hover:bg-surface-muted whitespace-nowrap"
              >
                + New repository
              </Link>
            }
          />
        </div>

        {/* LEFT: Platform Status */}
        <div
          className="animate-fade-up lg:order-1"
          style={{ animationDelay: "0ms" }}
        >
          <SectionLabel as="h2" className="mb-2 block">
            // platform status
          </SectionLabel>
          <PageSection>
            <PlatformStatus />
            <Separator className="my-4" />
            <LatestNews />
          </PageSection>
        </div>

        {/* RIGHT: Quick Links + KubeConfig + Top Visitors */}
        <div
          className="animate-fade-up lg:order-3"
          style={{ animationDelay: "160ms" }}
        >
          <SectionLabel as="h2" className="mb-2 block">
            // quick links
          </SectionLabel>
          <PageSection>
            <QuickLinks />
          </PageSection>

          <SectionLabel as="h2" className="mb-2 block">
            // need help?
          </SectionLabel>
          <PageSection>
            <p className="text-[0.8125rem] text-secondary leading-[1.6] mb-3">
              Most things you need are already documented. The{" "}
              <a
                href="https://wiki.dfds.cloud/en/playbooks"
                target="_blank"
                rel="noreferrer"
                className="text-action hover:underline"
              >
                playbooks
              </a>{" "}
              cover the most common tasks — start there.
            </p>
            <p className="text-[0.8125rem] text-secondary leading-[1.6] mb-2">
              Got a question the docs don't answer? The community on Slack is
              the fastest way to get unblocked:
            </p>
            <TrackedLink
              trackName="SlackArchive-DevPeerSupport"
              href="slack://dfds.slack.com/archives/C9948TVRC"
              className="inline-flex items-center h-[30px] px-3 bg-transparent text-secondary border border-card rounded-[5px] font-mono text-[0.6875rem] tracking-[0.04em] no-underline transition-colors hover:bg-surface-muted"
            >
              #dev-peer-support
            </TrackedLink>
          </PageSection>
        </div>
      </div>
    </div>
  );
}
