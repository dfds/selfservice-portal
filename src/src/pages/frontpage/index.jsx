import AppContext from "@/AppContext";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import PageSection from "@/components/PageSection";
import LatestNews from "./LatestNews";
import QuickLinks from "./QuickLinks";
import UpcomingEvents from "./UpcomingEvents";
import MyCapabilities from "./MyCapabilities";
import PlatformStatus from "./PlatformStatus";
import { useStats } from "@/state/remote/queries/stats";
import { TrackedLink } from "@/components/Tracking";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Code } from "@/components/ui/Code";
import {
  Layers,
  Cloud,
  Server,
  Database,
  Globe,
  Lock,
  List,
} from "lucide-react";

const STAT_CONFIG = [
  { icon: <Layers size={16} />, bg: "#e8f4fb", color: "#0e7cc1" },
  { icon: <Cloud size={16} />, bg: "rgba(237,136,0,0.1)", color: "#ed8800" },
  { icon: <Server size={16} />, bg: "rgba(76,175,80,0.1)", color: "#4caf50" },
  { icon: <Database size={16} />, bg: "#ede9fe", color: "#6d28d9" },
  { icon: <Globe size={16} />, bg: "rgba(14,124,193,0.1)", color: "#0e7cc1" },
  { icon: <Lock size={16} />, bg: "#eef0f1", color: "#666666" },
];

function HeroRow({ name }) {
  const { data: stats, isFetched } = useStats();
  const firstName = name.split(" ")[0] || name;

  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-4">
      <div>
        <div className="font-mono text-[11px] font-semibold tracking-[0.15em] uppercase text-action mb-1.5">
          // Developer Portal
        </div>
        <h1 className="text-[1.75rem] font-bold text-primary font-mono tracking-[-0.02em] leading-[1.2] mb-1.5">
          Hello, {firstName}
        </h1>
        {isFetched && stats && stats.length > 0 ? (
          <div className="font-mono text-[12px] text-muted tracking-[0.03em]">
            Welcome back
          </div>
        ) : (
          <p className="font-mono text-[12px] text-muted tracking-[0.03em]">
            Welcome to the DFDS Self Service Developer Portal
          </p>
        )}
      </div>
      {isFetched && stats && stats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 flex-shrink-0">
          {stats.map((stat, i) => {
            const cfg = STAT_CONFIG[i] || STAT_CONFIG[0];
            return (
              <div
                key={i}
                className="bg-surface border border-card rounded-[8px] flex items-center gap-2.5 px-3 py-2.5 min-w-[110px] animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div
                  className="w-[30px] h-[30px] rounded-[6px] flex items-center justify-center flex-shrink-0"
                  style={{ background: cfg.bg, color: cfg.color }}
                >
                  {cfg.icon}
                </div>
                <div>
                  <span
                    className="block font-mono text-[1.125rem] font-bold leading-none mb-[3px]"
                    style={{ color: cfg.color }}
                  >
                    {stat.value}
                  </span>
                  <span className="block font-mono text-[9px] tracking-[0.08em] uppercase text-muted">
                    {stat.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NavCard({ to, href, iconBg, icon, name, description, action }) {
  const stretchedLink = to ? (
    <Link to={to} className="absolute inset-0 rounded-[10px]" aria-label={name} />
  ) : (
    <a href={href} target="_blank" rel="noreferrer" className="absolute inset-0 rounded-[10px]" aria-label={name} />
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
        <div className="text-[14px] font-semibold text-primary mb-[3px]">
          {name}
        </div>
        <div className="text-[12px] text-muted leading-[1.5]">
          {description}
        </div>
      </div>
      {action && (
        <div className="relative z-10 flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}

export default function FrontPage() {
  const { user } = useContext(AppContext);
  const name = user?.name ?? "there";

  return (
    <div className="p-4 sm:p-8">
      <HeroRow name={name} />

      {/* Notice */}
      <div
        className="mb-[1.75rem] bg-[rgba(237,136,0,0.1)] dark:bg-[rgba(237,136,0,0.08)] border border-[rgba(237,136,0,0.25)] dark:border-[rgba(237,136,0,0.2)] rounded-[6px] px-4 py-3 font-mono text-[12px] text-[#ed8800] leading-[1.6] animate-fade-up"
        style={{ animationDelay: "40ms" }}
      >
        <span className="font-bold tracking-[0.05em]">NOTE — </span>
        Invitations to capabilities have been <strong>removed</strong>. Having
        multiple ways to join a capability made it harder for people to know
        what the process was — we've gone back to having just one way to join a
        capability.
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-5 items-start">
        {/* LEFT: Latest News + Upcoming Events + Need Help */}
        <div className="animate-fade-up" style={{ animationDelay: "0ms" }}>
          <SectionLabel as="h2" className="mb-2 block">
            // latest news
          </SectionLabel>
          <PageSection>
            <LatestNews />
          </PageSection>

          <SectionLabel as="h2" className="mb-2 block">
            // upcoming events
          </SectionLabel>
          <PageSection>
            <UpcomingEvents />
          </PageSection>

          <SectionLabel as="h2" className="mb-2 block">
            // platform status
          </SectionLabel>
          <PageSection>
            <PlatformStatus />
          </PageSection>

        </div>

        {/* CENTER: My Capabilities + Platform nav cards */}
        <div className="animate-fade-up" style={{ animationDelay: "80ms" }}>
          <SectionLabel as="h2" className="mb-2 block">
            // my capabilities
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
                className="inline-flex items-center h-[28px] px-2.5 bg-transparent text-secondary border border-card rounded-[5px] font-mono text-[11px] tracking-[0.04em] no-underline transition-colors hover:bg-surface-muted whitespace-nowrap"
              >
                + New
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
            icon={<span className="text-[18px] text-[#16a34a]">☸</span>}
            name="Kubernetes"
            description="First visit? Start with the Kubernetes Getting Started guide. Then download your cluster config from Quick Links."
          />
          <NavCard
            to="/ecr"
            iconBg="#fef3c7"
            icon={<span className="text-[18px] text-[#ed8800]">□</span>}
            name="ECR Repositories"
            description="Browse and manage your team's container image repositories across AWS accounts."
            action={
              <Link
                to="/ecr?new=true"
                className="inline-flex items-center h-[28px] px-2.5 bg-transparent text-secondary border border-card rounded-[5px] font-mono text-[11px] tracking-[0.04em] no-underline transition-colors hover:bg-surface-muted whitespace-nowrap"
              >
                + New
              </Link>
            }
          />
        </div>

        {/* RIGHT: Quick Links + KubeConfig + Top Visitors */}
        <div className="animate-fade-up" style={{ animationDelay: "160ms" }}>
          <SectionLabel as="h2" className="mb-2 block">
            // quick links
          </SectionLabel>
          <PageSection>
            <QuickLinks />
          </PageSection>

          <SectionLabel as="h2" className="mb-2 block">
            // kubeconfig
          </SectionLabel>
          <PageSection>
            <p className="text-[13px] text-secondary leading-[1.6] mb-3">
              Looking for a fresh config for your <Code>kubectl</Code>?
            </p>
            <TrackedLink
              trackName="DownloadKubeConfig"
              href="https://dfds-oxygen-k8s-public.s3-eu-west-1.amazonaws.com/kubeconfig/hellman-saml.config"
              className="inline-flex items-center h-[30px] px-3 bg-transparent text-secondary border border-card rounded-[5px] font-mono text-[11px] tracking-[0.04em] no-underline transition-colors hover:bg-surface-muted"
            >
              ↓ hellman-saml.config
            </TrackedLink>
          </PageSection>

          <SectionLabel as="h2" className="mb-2 block">
            // need help?
          </SectionLabel>
          <PageSection>
            <p className="text-[13px] text-secondary leading-[1.6] mb-3">
              Cloud Engineering provides the platform on a <strong>best-effort</strong> basis.
              We're here to help, but response times may vary.
            </p>
            <p className="text-[13px] text-secondary leading-[1.6] mb-3">
              Check the <a href="https://wiki.dfds.cloud/en/playbooks" target="_blank" rel="noreferrer" className="text-action hover:underline">playbooks</a> first — most common tasks are documented there.
            </p>
            <p className="text-[13px] text-secondary leading-[1.6] mb-2">
              Still stuck? Ask the community on Slack:
            </p>
            <TrackedLink
              trackName="SlackArchive-DevPeerSupport"
              href="slack://dfds.slack.com/archives/C9948TVRC"
              className="inline-flex items-center h-[30px] px-3 bg-transparent text-secondary border border-card rounded-[5px] font-mono text-[11px] tracking-[0.04em] no-underline transition-colors hover:bg-surface-muted"
            >
              #dev-peer-support
            </TrackedLink>
          </PageSection>
        </div>
      </div>
    </div>
  );
}
