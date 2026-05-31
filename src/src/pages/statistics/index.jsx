import React from "react";
import Page from "@/components/Page";
import PageSection from "@/components/PageSection";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useStats } from "@/state/remote/queries/stats";
import TopVisitors from "@/pages/frontpage/TopVisitors";
import { Skeleton } from "@/components/ui/skeleton";
import { Layers, Cloud, Server, Database, Globe, Lock } from "lucide-react";

const STAT_CONFIG = [
  { icon: <Layers size={18} />, bg: "#e8f4fb", color: "#0e7cc1" },
  { icon: <Cloud size={18} />, bg: "rgba(237,136,0,0.1)", color: "#ed8800" },
  { icon: <Server size={18} />, bg: "rgba(76,175,80,0.1)", color: "#4caf50" },
  { icon: <Database size={18} />, bg: "#ede9fe", color: "#6d28d9" },
  { icon: <Globe size={18} />, bg: "rgba(14,124,193,0.1)", color: "#0e7cc1" },
  { icon: <Lock size={18} />, bg: "#eef0f1", color: "#666666" },
];

function StatsGrid() {
  const { data: stats, isFetched } = useStats();

  if (!isFetched) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-[72px] rounded-[8px]" />
        ))}
      </div>
    );
  }

  if (!stats || stats.length === 0) {
    return (
      <p className="font-mono text-[11px] text-muted tracking-[0.03em]">
        No statistics available.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
      {stats.map((stat, i) => {
        const cfg = STAT_CONFIG[i] || STAT_CONFIG[0];
        return (
          <div
            key={i}
            className="bg-surface border border-card rounded-[8px] flex items-center gap-2.5 px-3 py-3 animate-fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div
              className="w-[34px] h-[34px] rounded-[7px] flex items-center justify-center flex-shrink-0"
              style={{ background: cfg.bg, color: cfg.color }}
            >
              {cfg.icon}
            </div>
            <div className="min-w-0">
              <span
                className="block font-mono text-[1.25rem] font-bold leading-none mb-[4px]"
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
  );
}

export default function StatisticsPage() {
  return (
    <Page title="Statistics">
      <div className="animate-fade-up animate-stagger-1 mb-6">
        <SectionLabel as="h2" className="mb-2 block">
          // platform
        </SectionLabel>
        <StatsGrid />
      </div>

      <div className="animate-fade-up animate-stagger-2 max-w-[480px]">
        <SectionLabel as="h2" className="mb-2 block">
          // top visitors
        </SectionLabel>
        <PageSection>
          <TopVisitors />
        </PageSection>
      </div>
    </Page>
  );
}
