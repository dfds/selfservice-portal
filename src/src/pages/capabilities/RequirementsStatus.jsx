import React, { useContext, useEffect } from "react";
import { ExternalLink } from "lucide-react";
import PageSection from "components/PageSection";
import SelectedCapabilityContext from "./SelectedCapabilityContext";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SkeletonRequirementsScore, SkeletonRequirementsRow } from "@/components/ui/skeleton";

// Helper to get color based on score — also used by Capabilities.jsx
export function getScoreColor(score) {
  if (score < 0) return "#9e9e9e"; // gray for invalid scores
  if (score < 40) return "#f44336"; // red
  if (score < 50) return "#ff9800"; // orange
  if (score < 60) return "#ffeb3b"; // yellow
  if (score < 70) return "#cddc39"; // lime
  if (score < 80) return "#8bc34a"; // light green
  if (score < 90) return "#4caf50"; // green
  if (score < 95) return "#388e3c"; // darker green
  return "#1b5e20"; // very dark green
}

export function LightBulb({ score, size = 20 }) {
  const color = getScoreColor(score);
  return (
    <span
      title={`Score: ${score}`}
      style={{ display: "inline-flex", alignItems: "center" }}
    >
      <span
        style={{
          display: "inline-block",
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundColor: color,
        }}
      />
    </span>
  );
}

export function QuestionMarkBulb({ size = 20, onClick, title = "Data may be stale" }) {
  return (
    <span
      title={title}
      onClick={onClick}
      style={{
        display: "inline-block",
        marginRight: 8,
        verticalAlign: "middle",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundColor: "#9e9e9e",
          color: "#fff",
          fontSize: size * 0.7,
          fontWeight: "bold",
          fontFamily: "sans-serif",
        }}
      >
        ?
      </span>
    </span>
  );
}

export default function RequirementsScore() {
  const { isLoading, requirementsScore, requirementsScoreLoading } = useContext(SelectedCapabilityContext);

  const [overallScore, setOverallScore] = React.useState(0);
  const [requirementsMetrics, setRequirementsMetrics] = React.useState([]);

  useEffect(() => {
    if (requirementsScore && Object.keys(requirementsScore).length !== 0) {
      setOverallScore(requirementsScore.totalScore);
      setRequirementsMetrics(requirementsScore.requirementsMetrics);
    }
  }, [requirementsScore]);

  const totalCount = requirementsMetrics.length;
  const metCount = requirementsMetrics.filter((m) => m.value >= 80).length;
  const scoreColor = getScoreColor(overallScore);

  const loading = isLoading || requirementsScoreLoading;

  return (
    <PageSection id="requirements-status" headline="Requirements Status">
      {/* Overall score */}
      {loading ? (
        <SkeletonRequirementsScore />
      ) : (
        <div className="mb-4">
          <span
            className="font-mono text-[1.5rem] font-bold block mb-1.5"
            style={{ color: scoreColor }}
          >
            {totalCount > 0 ? `${metCount} / ${totalCount}` : `${overallScore.toFixed(1)}%`}
          </span>
          <ProgressBar value={overallScore} color={scoreColor} className="mb-1.5" />
          <span className="font-mono text-[11px] text-[#afafaf] dark:text-slate-500 tracking-[0.04em]">
            {totalCount > 0
              ? `${metCount} of ${totalCount} requirements met`
              : `${overallScore.toFixed(1)}% overall score`}
          </span>
        </div>
      )}

      {/* Individual metrics */}
      {loading ? (
        <div className="border border-[#d9dcde] dark:border-[#334155] rounded-[6px] overflow-hidden">
          {[0, 1, 2].map((i) => (
            <SkeletonRequirementsRow key={i} isLast={i === 2} />
          ))}
        </div>
      ) : requirementsMetrics && requirementsMetrics.length > 0 ? (
        <div className="border border-[#d9dcde] dark:border-[#334155] rounded-[6px] overflow-hidden">
          {requirementsMetrics.map((metric, index) => (
            <div
              key={metric.id}
              className={`px-4 py-3 flex items-start gap-3 ${
                index < requirementsMetrics.length - 1 ? "border-b border-[#eeeeee] dark:border-[#1e2d3d]" : ""
              }`}
            >
              <div className="flex-shrink-0 mt-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getScoreColor(metric.value) }}
                  title={`Score: ${metric.value.toFixed(1)}%`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-[13px] font-medium text-[#002b45] dark:text-[#e2e8f0]">
                    {metric.displayName || metric.name}
                  </span>
                  <span
                    className="font-mono text-[12px] font-bold flex-shrink-0"
                    style={{ color: getScoreColor(metric.value) }}
                  >
                    {metric.value.toFixed(1)}%
                  </span>
                </div>
                {metric.description && (
                  <p className="text-[12px] text-[#666666] dark:text-slate-400 leading-[1.5]">
                    {metric.description}
                  </p>
                )}
                {metric.helpUrl && (
                  <a
                    href={metric.helpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-1 text-[11px] text-[#0e7cc1] dark:text-[#60a5fa] hover:underline"
                  >
                    <ExternalLink size={10} />
                    read more
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-5 text-center text-[13px] text-[#afafaf] dark:text-slate-500 italic">
          All is good! We see no issues with the current requirements for this capability.
        </div>
      )}
    </PageSection>
  );
}
