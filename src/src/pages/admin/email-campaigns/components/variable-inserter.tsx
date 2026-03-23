import React, { useState } from "react";
import { useTemplateVariables } from "@/state/remote/queries/emailCampaigns";
import { ChevronDown, Search } from "lucide-react";
import type { Editor } from "@tiptap/core";

interface VariableInserterProps {
  editor: Editor | null;
}

export function VariableInserter({ editor }: VariableInserterProps) {
  const { data: variables, isFetched } = useTemplateVariables();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  if (!editor) return null;

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
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium border border-card bg-surface hover:bg-white dark:hover:bg-slate-700 text-secondary cursor-pointer transition-colors"
      >
        <span>{"{{"}</span>
        Insert Variable
        <ChevronDown
          size={12}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 w-72 rounded-lg border border-card bg-surface shadow-overlay overflow-hidden animate-menu-enter">
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
                className="w-full h-8 pl-8 pr-3 rounded-md border border-card bg-surface text-[12px] text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-action"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            {!isFetched ? (
              <div className="px-3 py-4 text-center text-muted text-[12px]">
                Loading...
              </div>
            ) : Object.keys(grouped).length === 0 ? (
              <div className="px-3 py-4 text-center text-muted text-[12px]">
                No variables found
              </div>
            ) : (
              Object.entries(grouped).map(([entity, vars]) => (
                <div key={entity}>
                  <div className="px-2 py-1 text-[10px] font-semibold tracking-wider uppercase text-muted font-mono">
                    {entity}
                  </div>
                  {(vars as any[]).map((v: any) => (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => insert(v.name)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left hover:bg-[#f2f2f2] dark:hover:bg-slate-700 cursor-pointer border-0 bg-transparent transition-colors"
                    >
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[11px] font-mono font-medium">
                        {`{{${v.name}}}`}
                      </span>
                      <span className="text-[11px] text-muted truncate">
                        {v.description}
                      </span>
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
