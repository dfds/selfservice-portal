import React, { useState } from "react";
import { useTemplateVariables } from "@/state/remote/queries/emailCampaigns";
import { ChevronDown, Search } from "lucide-react";
import type { Editor } from "@tiptap/core";

interface VariableInserterProps {
  editor: Editor | null;
  targetType?: "Capability" | "User";
}

export function VariableInserter({
  editor,
  targetType = "Capability",
}: VariableInserterProps) {
  const { data: variables, isFetched } = useTemplateVariables(targetType);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  if (!editor) return null;

  // In User campaigns, capability-scoped variables only resolve inside a
  // {{#each User.Capabilities}} block — flag them so authors know where they apply.
  const showScopeChip = targetType === "User";

  const filtered = (variables || []).filter(
    (v: any) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase()),
  );

  const grouped = (filtered as any[]).reduce(
    (acc: Record<string, any[]>, v: any) => {
      if (!acc[v.entity]) acc[v.entity] = [];
      acc[v.entity].push(v);
      return acc;
    },
    {} as Record<string, any[]>,
  );

  const insert = (name: string) => {
    editor.chain().focus().insertTemplateVariable(name).run();
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[0.75rem] font-medium border border-card bg-surface hover:bg-white dark:hover:bg-slate-700 text-secondary cursor-pointer transition-colors"
      >
        <span>{"{{"}</span>
        Insert Variable
        <ChevronDown
          size={12}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 w-[26rem] rounded-lg border border-card bg-surface shadow-overlay overflow-hidden animate-menu-enter">
          <div className="p-2 border-b border-card">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search variables..."
                className="w-full h-8 pl-8 pr-3 rounded-md border border-card bg-surface text-[0.75rem] text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-action"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-[28rem] overflow-y-auto p-1">
            {!isFetched ? (
              <div className="px-3 py-4 text-center text-muted text-[0.75rem]">
                Loading...
              </div>
            ) : Object.keys(grouped).length === 0 ? (
              <div className="px-3 py-4 text-center text-muted text-[0.75rem]">
                No variables found
              </div>
            ) : (
              Object.entries(grouped).map(([entity, vars]) => (
                <div key={entity}>
                  <div className="px-2 py-1 text-[0.625rem] font-semibold tracking-wider uppercase text-muted font-mono">
                    {entity}
                  </div>
                  {(vars as any[]).map((v: any) => (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => insert(v.name)}
                      className="w-full flex flex-col items-start gap-1 px-2 py-2 rounded-md text-left hover:bg-[#f2f2f2] dark:hover:bg-slate-700 cursor-pointer border-0 bg-transparent transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[0.6875rem] font-mono font-medium">
                          {`{{${v.name}}}`}
                        </span>
                        {showScopeChip && v.scope === "perCapability" && (
                          <span
                            title="Use inside {{#each User.Capabilities}}"
                            className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-[0.625rem] font-medium"
                          >
                            loop
                          </span>
                        )}
                      </span>
                      {v.description && (
                        <span className="text-[0.6875rem] text-secondary leading-snug">
                          {v.description}
                        </span>
                      )}
                      {v.example && (
                        <span className="text-[0.625rem] text-muted leading-snug">
                          e.g.{" "}
                          <span className="font-mono text-muted">
                            {v.example}
                          </span>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
