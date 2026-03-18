import * as React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-[5px] bg-[length:200%_100%]",
        "bg-[linear-gradient(90deg,#e5e7eb_25%,#d1d5db_50%,#e5e7eb_75%)]",
        "dark:bg-[linear-gradient(90deg,#1e293b_25%,#2d3e50_50%,#1e293b_75%)]",
        className,
      )}
      {...props}
    />
  );
}

// Release notes: DateFlag (70×42) + title bar
export function SkeletonReleaseNoteRow() {
  return (
    <div className="py-3 flex items-center gap-3">
      <Skeleton className="w-[70px] h-[42px] flex-shrink-0" />
      <Skeleton className="h-4 flex-1" style={{ maxWidth: "360px" }} />
    </div>
  );
}

// Capability details: back link + h1
export function SkeletonCapabilityHeader() {
  return (
    <div className="mb-6">
      <Skeleton className="h-3 w-[90px] mb-4" />
      <Skeleton className="h-7 w-[260px] mb-2" />
      <Skeleton className="h-3 w-[180px]" />
    </div>
  );
}

// Capability details: key-value summary grid
export function SkeletonCapabilitySummary() {
  const rows: [string, string][] = [
    ["80px", "180px"],
    ["70px", "260px"],
    ["90px", "200px"],
    ["90px", "100%"],
    ["90px", "85%"],
  ];
  return (
    <div
      className="grid gap-x-4 gap-y-3"
      style={{ gridTemplateColumns: "130px 1fr" }}
    >
      {rows.map(([labelW, valW], i) => (
        <React.Fragment key={i}>
          <Skeleton className="h-3 self-center" style={{ width: labelW }} />
          <Skeleton className="h-3 self-center" style={{ width: valW }} />
        </React.Fragment>
      ))}
    </div>
  );
}

// Topics: topic name + cluster pill + chevron stub
export function SkeletonTopicRow() {
  return (
    <div className="flex items-center gap-[0.875rem] px-[1.125rem] py-[0.875rem] border-b border-[#eeeeee] dark:border-[#1e2d3d]">
      <Skeleton className="h-3 flex-1" style={{ maxWidth: "300px" }} />
      <Skeleton className="h-[22px] w-[80px] rounded-full flex-shrink-0" />
      <Skeleton className="h-3 w-3 flex-shrink-0" />
    </div>
  );
}

// Capabilities table: name (wide) + status pill + aws badge + member count stub
export function SkeletonCapabilityTableRow() {
  return (
    <div className="flex items-center gap-4 px-[1.125rem] py-[0.875rem] border-b border-[#eeeeee] dark:border-[#1e2d3d]">
      <Skeleton className="h-3 flex-1" style={{ maxWidth: "260px" }} />
      <Skeleton className="h-[22px] w-[72px] rounded-full flex-shrink-0" />
      <Skeleton className="h-3 w-[120px] flex-shrink-0" />
      <Skeleton className="h-3 w-8 flex-shrink-0" />
    </div>
  );
}

// ECR: description (2fr) + name (3fr) columns
export function SkeletonEcrRow() {
  return (
    <div
      className="grid border-b border-[#eeeeee] dark:border-[#1e2d3d] px-[1.125rem] py-[0.875rem] items-center"
      style={{ gridTemplateColumns: "2fr 3fr" }}
    >
      <Skeleton className="h-3" style={{ maxWidth: "180px" }} />
      <Skeleton className="h-3" style={{ maxWidth: "240px" }} />
    </div>
  );
}

// Demos: button-shaped skeleton for the signup action area
export function SkeletonDemoAction() {
  return <Skeleton className="h-[30px] w-[152px] rounded-[5px]" />;
}

// Self assessment: status icon + description bar + 3 toggle buttons (capability detail section)
export function SkeletonSelfAssessmentRow() {
  return (
    <div className="flex items-center mb-[15px]">
      <Skeleton className="w-[25px] h-[25px] rounded-full flex-shrink-0 mr-[15px]" />
      <Skeleton className="h-4 flex-1 mr-4" />
      <div className="flex gap-[10px] flex-shrink-0">
        <Skeleton className="w-[40px] h-[30px] rounded-[4px]" />
        <Skeleton className="w-[40px] h-[30px] rounded-[4px]" />
        <Skeleton className="w-[40px] h-[30px] rounded-[4px]" />
      </div>
    </div>
  );
}

// Self assessments admin page: toggle + description + short name (card-wrapped in page)
export function SkeletonSelfAssessmentCard() {
  return (
    <div className="mb-2 rounded-lg border border-card bg-surface p-4">
      <div className="flex items-center gap-3 mb-2">
        <Skeleton className="w-[50px] h-[25px] rounded-full flex-shrink-0" />
        <Skeleton className="h-4 flex-1" />
      </div>
      <Skeleton className="h-3 w-[120px]" />
    </div>
  );
}

// Latest news: timestamp + title + link
export function SkeletonNewsItem({
  isFirst = false,
  isLast = false,
}: {
  isFirst?: boolean;
  isLast?: boolean;
}) {
  return (
    <div
      className={`py-[0.625rem] border-b border-[#eeeeee] dark:border-[#1e2d3d] ${
        isFirst ? "pt-0" : ""
      } ${isLast ? "border-0 pb-0" : ""}`}
    >
      <Skeleton className="h-2.5 w-[52px] mb-[4px]" />
      <Skeleton className="h-3.5 w-[82%] mb-[5px]" />
      <Skeleton className="h-2.5 w-[56px]" />
    </div>
  );
}

// Top visitors: rank + avatar circle + name
export function SkeletonVisitorRow({
  isFirst = false,
  isLast = false,
}: {
  isFirst?: boolean;
  isLast?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-[0.625rem] py-2 border-b border-divider ${
        isFirst ? "pt-0" : ""
      } ${isLast ? "border-0 pb-0" : ""}`}
    >
      <Skeleton className="w-4 h-2.5 flex-shrink-0" />
      <Skeleton className="w-[26px] h-[26px] rounded-full flex-shrink-0" />
      <Skeleton className="h-3 w-[110px]" />
    </div>
  );
}

// Requirements: score value + progress bar + subtitle
export function SkeletonRequirementsScore() {
  return (
    <div className="mb-4">
      <Skeleton className="h-7 w-[72px] mb-1.5" />
      <Skeleton className="h-[6px] w-full mb-1.5" />
      <Skeleton className="h-2.5 w-[160px]" />
    </div>
  );
}

// Requirements: single metric row — dot + name + score
export function SkeletonRequirementsRow({
  isLast = false,
}: {
  isLast?: boolean;
}) {
  return (
    <div
      className={`px-4 py-3 flex items-start gap-3 ${
        !isLast ? "border-b border-[#eeeeee] dark:border-[#1e2d3d]" : ""
      }`}
    >
      <Skeleton className="w-3 h-3 rounded-full mt-1 flex-shrink-0" />
      <div className="flex-1 flex items-center justify-between gap-2">
        <Skeleton className="h-3" style={{ width: "55%" }} />
        <Skeleton className="h-3 w-[36px] flex-shrink-0" />
      </div>
    </div>
  );
}

// Membership application: capability name + applicant + dates + action stub
export function SkeletonMembershipApplicationRow({
  isLast = false,
}: {
  isLast?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 py-[10px] ${
        !isLast ? "border-b border-[#eeeeee] dark:border-[#1e2d3d]" : ""
      }`}
    >
      <Skeleton className="h-3 flex-1" style={{ maxWidth: "220px" }} />
      <Skeleton className="h-3 w-[140px] flex-shrink-0" />
      <Skeleton className="h-3 w-[96px] flex-shrink-0" />
      <Skeleton className="h-3 w-[96px] flex-shrink-0" />
      <Skeleton className="h-[26px] w-[72px] rounded-[4px] flex-shrink-0" />
    </div>
  );
}

// Compliance dashboard: cost centre card — donut + name/count + score, progress strip, chip row
export function SkeletonComplianceCard() {
  return (
    <div className="bg-surface border border-card rounded-[10px] overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-[110px]" />
          <Skeleton className="h-2.5 w-[70px]" />
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <Skeleton className="h-5 w-[44px]" />
          <Skeleton className="h-2.5 w-[52px]" />
        </div>
        <Skeleton className="w-3.5 h-3.5 flex-shrink-0" />
      </div>
      <Skeleton className="h-1 w-full rounded-none" />
      <div className="flex gap-1.5 px-4 py-3">
        <Skeleton className="h-5 w-[64px] rounded-full" />
        <Skeleton className="h-5 w-[56px] rounded-full" />
        <Skeleton className="h-5 w-[72px] rounded-full" />
      </div>
    </div>
  );
}

// Email campaign list row: name + subject + status badge + date + action buttons
export function SkeletonCampaignRow() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-card">
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <Skeleton className="h-3.5 w-[200px]" />
        <Skeleton className="h-2.5 w-[140px]" />
      </div>
      <Skeleton className="h-5 w-[60px] rounded-full flex-shrink-0" />
      <Skeleton className="h-3 w-[80px] flex-shrink-0" />
      <div className="flex gap-1">
        <Skeleton className="h-7 w-7 rounded flex-shrink-0" />
        <Skeleton className="h-7 w-7 rounded flex-shrink-0" />
      </div>
    </div>
  );
}

// Email campaign detail: header + info cards + content area
export function SkeletonCampaignDetail() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-3 w-[120px]" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-[240px]" />
        <Skeleton className="h-5 w-[60px] rounded-full" />
      </div>
      <Skeleton className="h-3 w-[180px]" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-card p-3">
            <Skeleton className="h-2.5 w-[50px] mb-2" />
            <Skeleton className="h-4 w-[80px]" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-card p-3 text-center">
            <Skeleton className="h-2.5 w-[40px] mx-auto mb-2" />
            <Skeleton className="h-5 w-[30px] mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

// StatCard value area — uses darker gradient since the card bg is already surface-muted
export function SkeletonStatCardValue({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-[5px] bg-[length:200%_100%]",
        "bg-[linear-gradient(90deg,#e0e3e5_25%,#cdd2d6_50%,#e0e3e5_75%)]",
        "dark:bg-[linear-gradient(90deg,#182032_25%,#22304a_50%,#182032_75%)]",
        className,
      )}
    />
  );
}
