import React, { useEffect, useState, useContext, useMemo } from "react";
import { SkeletonTopicRow } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";
import { InfoAlert } from "@/components/ui/InfoAlert";
import { TopicsProvider } from "./TopicsContext";
import AppContext from "../../AppContext";
import { usePublicTopics } from "@/state/remote/queries/kafka";
import { RowDetails } from "./rowDetails";

const CLUSTER_COLORS = ["#ED8800", "#4caf50", "#49a2df", "#F1A7AE", "purple"];

function Topics() {
  const { selfServiceApiClient } = useContext(AppContext);
  const { isFetched, data } = usePublicTopics();

  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState(new Set());

  useEffect(() => {
    if (!isFetched) return;
    selfServiceApiClient.getKafkaClusters().then((clusters) => {
      const colored = clusters.map((c, i) => ({
        ...c,
        color: CLUSTER_COLORS[i % CLUSTER_COLORS.length],
      }));
      const final = data.map((topic) => {
        const cluster = colored.find((c) => c.id === topic.kafkaClusterId);
        return { ...topic, clusterColor: cluster?.color };
      });
      setTopics(final);
      setIsLoading(false);
    });
  }, [isFetched, data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return topics;
    return topics.filter((t) => t.name?.toLowerCase().includes(q));
  }, [topics, search]);

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
      <div className="mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search topics..."
          className="w-full h-[38px] px-4 bg-white dark:bg-[#0f172a] border border-[#d9dcde] dark:border-[#334155] rounded-[6px] font-mono text-[12px] text-[#002b45] dark:text-[#e2e8f0] outline-none focus:border-[#0e7cc1] dark:focus:border-[#60a5fa] placeholder:text-[#afafaf] dark:placeholder:text-[#64748b]"
        />
      </div>

      {isLoading ? (
        <div className="bg-white dark:bg-[#1e293b] border border-[#d9dcde] dark:border-[#334155] rounded-[8px] overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonTopicRow key={i} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1e293b] border border-[#d9dcde] dark:border-[#334155] rounded-[8px] overflow-hidden">
          {filtered.length === 0 && (
            <div className="px-[1.125rem] py-4 font-mono text-[12px] text-[#afafaf] dark:text-[#64748b]">
              No topics found.
            </div>
          )}
          {filtered.map((topic) => {
            const isExpanded = expandedIds.has(topic.id);
            return (
              <div key={topic.id} className="border-b border-[#eeeeee] dark:border-[#1e2d3d] last:border-0">
                <div
                  className="flex items-center gap-[0.875rem] px-[1.125rem] py-[0.875rem] cursor-pointer hover:bg-[#f2f2f2] dark:hover:bg-[#334155] transition-colors"
                  onClick={() => toggleExpand(topic.id)}
                >
                  <span className="font-mono text-[13px] font-semibold text-[#002b45] dark:text-[#e2e8f0] flex-1 tracking-[-0.01em]">
                    {topic.name}
                  </span>
                  {topic.kafkaClusterName && (
                    <span
                      className="font-mono text-[10px] font-semibold tracking-[0.06em] px-2 py-[3px] rounded-[20px] text-white flex-shrink-0"
                      style={{ backgroundColor: topic.clusterColor ?? "#afafaf" }}
                    >
                      {topic.kafkaClusterName}
                    </span>
                  )}
                  <ChevronRight
                    size={14}
                    className="flex-shrink-0 text-[#afafaf] transition-transform duration-150"
                    style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
                  />
                </div>

                {isExpanded && (
                  <div className="border-t border-[#eeeeee] dark:border-[#1e2d3d] bg-[#f2f2f2] dark:bg-[#0f172a] px-[1.125rem] pb-[1.125rem]">
                    <RowDetails data={topic} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default function TopicsPage() {
  return (
    <TopicsProvider>
      <div className="p-8">
        <div className="animate-fade-up">
          <div className="font-mono text-[11px] font-semibold tracking-[0.15em] uppercase text-[#0e7cc1] mb-1.5">
            // Kafka Topics
          </div>
          <h1 className="text-[1.75rem] font-bold text-[#002b45] dark:text-[#e2e8f0] font-mono tracking-[-0.02em] leading-[1.2] mb-6">
            Public Topics
          </h1>
        </div>

        <InfoAlert className="mb-5 animate-fade-up animate-stagger-1">
          A comprehensive list of Kafka topics available for development teams.
          Every capability has read access to all public topics. Handle
          sensitive data responsibly — both when producing and consuming.
        </InfoAlert>

        <div className="animate-fade-up animate-stagger-2">
          <Topics />
        </div>
      </div>
    </TopicsProvider>
  );
}
