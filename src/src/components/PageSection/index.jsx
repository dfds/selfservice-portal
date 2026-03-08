import React, { useState } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";

export function SectionContent({ title, children }) {
  return (
    <>
      {title && (
        <h3 className="text-base font-semibold text-[#002b45] dark:text-[#e2e8f0] mb-2">
          {title}
        </h3>
      )}
      <div>{children}</div>
    </>
  );
}

export default function PageSection({
  id,
  headline,
  headlineChildren,
  children,
}) {
  return (
    <section id={id} className="mb-4">
      <div className="bg-white dark:bg-[#1e293b] border border-[#d9dcde] dark:border-[#334155] rounded-[8px] overflow-hidden">
        {headline && (
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#eeeeee] dark:border-[#1e2d3d]">
            <SectionLabel>{headline}</SectionLabel>
            {headlineChildren && <div>{headlineChildren}</div>}
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    </section>
  );
}

export function TabbedPageSection({
  id,
  headline,
  headlineChildren,
  tabs,
  tabsContent,
  header,
  footer,
}) {
  const [selectedTab, setSelectedTab] = useState(Object.keys(tabs)[0]);

  return (
    <section id={id} className="mb-4">
      <div className="bg-white dark:bg-[#1e293b] border border-[#d9dcde] dark:border-[#334155] rounded-[8px] overflow-hidden">
        {headline && (
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#eeeeee] dark:border-[#1e2d3d]">
            <SectionLabel>{headline}</SectionLabel>
            {headlineChildren && <div>{headlineChildren}</div>}
          </div>
        )}
        <div className="flex border-b border-[#eeeeee] dark:border-[#1e2d3d]">
          {Object.keys(tabs).map((index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedTab(index)}
              className={`px-4 py-2.5 font-mono text-[11px] tracking-[0.04em] border-b-2 transition-colors bg-transparent cursor-pointer ${
                selectedTab === index
                  ? "text-[#002b45] dark:text-[#e2e8f0] border-[#0e7cc1] dark:border-[#60a5fa] font-medium"
                  : "text-[#afafaf] dark:text-[#64748b] border-transparent hover:text-[#002b45] dark:hover:text-[#e2e8f0]"
              }`}
            >
              {tabs[index]}
            </button>
          ))}
        </div>
        <div className="p-4">
          {header}
          {Object.keys(tabsContent).map(
            (index) =>
              selectedTab === index && (
                <div key={index}>{tabsContent[index]}</div>
              ),
          )}
          {footer}
        </div>
      </div>
    </section>
  );
}
