import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SkeletonEcrRow } from "@/components/ui/skeleton";
import NewRepositoryDialog from "./NewRepositoryDialog";
import { useEcrRepositories } from "@/state/remote/queries/ecr";
import { TrackedLink } from "@/components/Tracking";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { InfoAlert } from "@/components/ui/InfoAlert";

const PAGE_SIZE = 20;

const asDate = (dateString) => {
  let millis = Date.parse(dateString);
  let date = new Date(millis);
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const documentationUrl =
  "https://wiki.dfds.cloud/playbooks/supporting-services/ecr/push_image_to_an_ecr_repository";

function NoUri() {
  return (
    <span>
      Error producing URI. Please refer to the{" "}
      <TrackedLink trackName="Wiki-ECRRepositoryPush" href={documentationUrl}>
        documentation
      </TrackedLink>
    </span>
  );
}

function RepositoryDetailDialog({ repository, onClose }) {
  if (!repository) return null;
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ECR Repository Details</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-1">
          {[
            { label: "Description", value: repository.description },
            { label: "Name", value: repository.name },
            {
              label: "URI",
              value: repository.uri ? repository.uri : <NoUri />,
            },
            {
              label: "Created",
              value: repository.requestedAt
                ? `${asDate(repository.requestedAt)}, by ${
                    repository.createdBy
                  }`
                : "—",
            },
          ].map(({ label, value }) => (
            <div key={label} className="flex gap-4 text-[13px]">
              <span className="font-mono text-[9px] tracking-[0.08em] uppercase text-[#afafaf] pt-[3px] w-[100px] flex-shrink-0">
                {label}
              </span>
              <span className="text-[#002b45] dark:text-[#e2e8f0] break-all">
                {value}
              </span>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Repositories({ onNewRepository }) {
  const { isFetched, data } = useEcrRepositories();
  const [selectedRepository, setSelectedRepository] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const repos = data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return repos;
    return repos.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q),
    );
  }, [data, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageRepos = filtered.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE,
  );

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  return (
    <>
      {selectedRepository && (
        <RepositoryDetailDialog
          repository={selectedRepository}
          onClose={() => setSelectedRepository(null)}
        />
      )}

      <div className="mb-5">
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Find a repository..."
          className="w-full h-[38px] px-4 bg-white dark:bg-[#0f172a] border border-[#d9dcde] dark:border-[#334155] rounded-[6px] font-mono text-[16px] md:text-[12px] text-[#002b45] dark:text-[#e2e8f0] outline-none focus:border-[#0e7cc1] dark:focus:border-[#60a5fa] placeholder:text-[#afafaf] dark:placeholder:text-[#64748b]"
        />
      </div>

      {!isFetched ? (
        <div className="bg-white dark:bg-[#1e293b] border border-[#d9dcde] dark:border-[#334155] rounded-[8px] overflow-hidden">
          <div
            className="grid border-b border-[#d9dcde] dark:border-[#334155] bg-[#f2f2f2] dark:bg-[#0f172a] px-[1.125rem] py-[0.625rem]"
            style={{ gridTemplateColumns: "2fr 3fr" }}
          >
            <span className="font-mono text-[9px] font-semibold tracking-[0.1em] uppercase text-[#afafaf]">
              Description
            </span>
            <span className="font-mono text-[9px] font-semibold tracking-[0.1em] uppercase text-[#afafaf]">
              Name
            </span>
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonEcrRow key={i} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1e293b] border border-[#d9dcde] dark:border-[#334155] rounded-[8px] overflow-hidden">
          <div
            className="grid border-b border-[#d9dcde] dark:border-[#334155] bg-[#f2f2f2] dark:bg-[#0f172a] px-[1.125rem] py-[0.625rem]"
            style={{ gridTemplateColumns: "2fr 3fr" }}
          >
            <span className="font-mono text-[9px] font-semibold tracking-[0.1em] uppercase text-[#afafaf]">
              Description
            </span>
            <span className="font-mono text-[9px] font-semibold tracking-[0.1em] uppercase text-[#afafaf]">
              Name
            </span>
          </div>

          {filtered.length === 0 && (
            <div className="px-[1.125rem] py-4 font-mono text-[12px] text-[#afafaf]">
              No repositories found.
            </div>
          )}

          {pageRepos.map((repo) => (
            <div
              key={repo.name}
              className="grid border-b border-[#eeeeee] dark:border-[#1e2d3d] last:border-0 px-[1.125rem] py-[0.875rem] cursor-pointer hover:bg-[#f2f2f2] dark:hover:bg-[#334155] transition-colors items-center"
              style={{ gridTemplateColumns: "2fr 3fr" }}
              onClick={() => setSelectedRepository(repo)}
            >
              <span className="text-[13px] text-[#666666] dark:text-[#94a3b8] leading-[1.4] pr-4">
                {repo.description}
              </span>
              <span className="font-mono text-[12px] font-semibold text-[#002b45] dark:text-[#e2e8f0] tracking-[-0.01em]">
                {repo.name}
              </span>
            </div>
          ))}

          <div className="flex items-center justify-between px-[1.125rem] py-3 border-t border-[#d9dcde] dark:border-[#334155] bg-[#f2f2f2] dark:bg-[#0f172a]">
            <span className="font-mono text-[11px] text-[#afafaf] tracking-[0.04em]">
              {filtered.length}{" "}
              {filtered.length === 1 ? "repository" : "repositories"}
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="w-7 h-7 flex items-center justify-center border border-[#d9dcde] dark:border-[#334155] rounded-[4px] bg-white dark:bg-[#1e293b] text-[#666666] dark:text-[#94a3b8] disabled:opacity-40 hover:bg-[#eef0f1] dark:hover:bg-[#334155] transition-colors"
                >
                  <ChevronLeft size={12} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-7 h-7 flex items-center justify-center border rounded-[4px] font-mono text-[11px] transition-colors ${
                      i === currentPage
                        ? "bg-[#0e7cc1] border-[#0e7cc1] text-white"
                        : "bg-white dark:bg-[#1e293b] border-[#d9dcde] dark:border-[#334155] text-[#666666] dark:text-[#94a3b8] hover:bg-[#eef0f1] dark:hover:bg-[#334155]"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={currentPage === totalPages - 1}
                  className="w-7 h-7 flex items-center justify-center border border-[#d9dcde] dark:border-[#334155] rounded-[4px] bg-white dark:bg-[#1e293b] text-[#666666] dark:text-[#94a3b8] disabled:opacity-40 hover:bg-[#eef0f1] dark:hover:bg-[#334155] transition-colors"
                >
                  <ChevronRight size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function ECRPage() {
  const [showNewRepositoryDialog, setShowNewRepositoryDialog] = useState(false);

  return (
    <div className="p-8">
      {showNewRepositoryDialog && (
        <NewRepositoryDialog
          onClose={() => setShowNewRepositoryDialog(false)}
        />
      )}

      <div className="flex items-start justify-between mb-6 gap-8 animate-fade-up">
        <div>
          <div className="font-mono text-[11px] font-semibold tracking-[0.15em] uppercase text-[#0e7cc1] mb-1.5">
            // Container Registries
          </div>
          <h1 className="text-[1.75rem] font-bold text-[#002b45] dark:text-[#e2e8f0] font-mono tracking-[-0.02em] leading-[1.2]">
            ECR Repositories
          </h1>
        </div>
        <div className="flex items-end pb-1">
          <Button
            variant="action"
            onClick={() => setShowNewRepositoryDialog(true)}
          >
            + New repository
          </Button>
        </div>
      </div>

      <InfoAlert className="mb-5 animate-fade-up animate-stagger-1">
        All AWS ECR repositories created by DFDS development teams. Naming
        convention:{" "}
        <code className="font-mono text-[12px] bg-[rgba(14,124,193,0.08)] dark:bg-[rgba(14,124,193,0.15)] px-[5px] py-[1px] rounded-[3px]">
          team-name/app-name
        </code>
        . See the{" "}
        <TrackedLink trackName="Wiki-ECRRepositoryPush" href={documentationUrl}>
          documentation
        </TrackedLink>{" "}
        for push instructions.
      </InfoAlert>

      <div className="animate-fade-up animate-stagger-2">
        <Repositories />
      </div>
    </div>
  );
}
