import React, { useState, useRef, useEffect, useCallback } from "react";
import type { Editor } from "@tiptap/core";
import { NodeSelection } from "@tiptap/pm/state";
import type { LucideIcon } from "lucide-react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  Check,
  Trash2,
  ChevronDown,
  Search,
} from "lucide-react";

interface TemplateVariable {
  name: string;
  description: string;
  entity: string;
}

interface FormattingToolbarProps {
  editor: Editor | null;
  variables: TemplateVariable[];
}

function FormatButton({
  editor,
  mark,
  icon: Icon,
  label,
}: {
  editor: Editor;
  mark: string;
  icon: LucideIcon;
  label: string;
}) {
  const isActive = editor.isActive(mark);
  const isDisabled = !editor.can().toggleMark(mark);

  return (
    <button
      type="button"
      onClick={() => editor.chain().focus().toggleMark(mark).run()}
      disabled={isDisabled}
      aria-label={label}
      aria-pressed={isActive}
      className={`p-1.5 rounded-md transition-colors cursor-pointer border-0 ${
        isActive
          ? "bg-action/10 text-action"
          : "bg-transparent text-secondary hover:bg-[#f2f2f2] dark:hover:bg-slate-700"
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      <Icon size={14} />
    </button>
  );
}

function LinkVariablePicker({
  variables,
  onSelect,
}: {
  variables: TemplateVariable[];
  onSelect: (varName: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = variables.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase()),
  );

  const grouped = filtered.reduce(
    (acc: Record<string, TemplateVariable[]>, v) => {
      if (!acc[v.entity]) acc[v.entity] = [];
      acc[v.entity].push(v);
      return acc;
    },
    {} as Record<string, TemplateVariable[]>,
  );

  useEffect(() => {
    if (!open) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open]);

  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open]);

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Insert variable into URL"
        className="flex items-center gap-0.5 p-1.5 rounded-md transition-colors cursor-pointer border-0 bg-transparent text-secondary hover:bg-[#f2f2f2] dark:hover:bg-slate-700"
      >
        <span className="text-[11px] font-mono font-medium">{"{{"}</span>
        <ChevronDown
          size={10}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 z-50 w-64 rounded-lg border border-card bg-surface shadow-overlay overflow-hidden animate-menu-enter">
          <div className="p-2 border-b border-card">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search variables..."
                className="w-full h-7 pl-8 pr-3 rounded-md border border-card bg-surface text-[12px] text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-action"
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {Object.keys(grouped).length === 0 ? (
              <div className="px-3 py-4 text-center text-muted text-[12px]">
                No variables found
              </div>
            ) : (
              Object.entries(grouped).map(([entity, vars]) => (
                <div key={entity}>
                  <div className="px-2 py-1 text-[10px] font-semibold tracking-wider uppercase text-muted font-mono">
                    {entity}
                  </div>
                  {vars.map((v) => (
                    <button
                      key={v.name}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onSelect(v.name);
                        setOpen(false);
                        setSearch("");
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left hover:bg-[#f2f2f2] dark:hover:bg-slate-700 cursor-pointer border-0 bg-transparent transition-colors"
                    >
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[10px] font-mono font-medium whitespace-nowrap">
                        {`{{${v.name}}}`}
                      </span>
                      <span className="text-[10px] text-muted truncate">
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

function LinkPopover({
  editor,
  variables,
}: {
  editor: Editor;
  variables: TemplateVariable[];
}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isActive = editor.isActive("link");

  const openPopover = useCallback(() => {
    const href = editor.getAttributes("link").href || "";
    setUrl(href);
    setOpen(true);
  }, [editor]);

  const closePopover = useCallback(() => {
    setOpen(false);
    setUrl("");
  }, []);

  const applyLink = useCallback(() => {
    if (!url.trim()) return;
    const isNode = editor.state.selection instanceof NodeSelection;
    const chain = editor.chain().focus();
    if (!isNode) {
      chain.extendMarkRange("link");
    }
    chain.setLink({ href: url.trim() }).run();
    closePopover();
  }, [editor, url, closePopover]);

  const removeLink = useCallback(() => {
    const isNode = editor.state.selection instanceof NodeSelection;
    const chain = editor.chain().focus();
    if (isNode) {
      chain.unsetMark("link");
    } else {
      chain.unsetLink();
    }
    chain.run();
    closePopover();
  }, [editor, closePopover]);

  const insertVariable = useCallback(
    (varName: string) => {
      const input = inputRef.current;
      if (!input) return;
      const pos = input.selectionStart ?? url.length;
      const token = `{{${varName}}}`;
      setUrl(url.slice(0, pos) + token + url.slice(pos));
      // Restore cursor after the inserted token
      requestAnimationFrame(() => {
        const newPos = pos + token.length;
        input.focus();
        input.setSelectionRange(newPos, newPos);
      });
    },
    [url],
  );

  useEffect(() => {
    if (!open) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        closePopover();
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open, closePopover]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => (open ? closePopover() : openPopover())}
        aria-label="Link"
        aria-pressed={isActive}
        className={`p-1.5 rounded-md transition-colors cursor-pointer border-0 ${
          isActive || open
            ? "bg-action/10 text-action"
            : "bg-transparent text-secondary hover:bg-[#f2f2f2] dark:hover:bg-slate-700"
        }`}
      >
        <Link size={14} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 rounded-lg border border-card bg-surface shadow-overlay animate-menu-enter">
          <div className="flex items-center gap-1 p-1.5">
            <input
              ref={inputRef}
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyLink();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  closePopover();
                  editor.commands.focus();
                }
              }}
              placeholder="Paste a link..."
              className="w-52 h-7 px-2.5 rounded-md border border-card bg-surface text-[12px] text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-action"
            />
            <LinkVariablePicker
              variables={variables}
              onSelect={insertVariable}
            />
            <button
              type="button"
              onClick={applyLink}
              disabled={!url.trim()}
              aria-label="Apply link"
              className="p-1.5 rounded-md transition-colors cursor-pointer border-0 bg-transparent text-secondary hover:bg-[#f2f2f2] dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check size={14} />
            </button>
            {isActive && (
              <button
                type="button"
                onClick={removeLink}
                aria-label="Remove link"
                className="p-1.5 rounded-md transition-colors cursor-pointer border-0 bg-transparent text-destructive hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function FormattingToolbar({
  editor,
  variables,
}: FormattingToolbarProps) {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-0.5">
      <FormatButton editor={editor} mark="bold" icon={Bold} label="Bold" />
      <FormatButton
        editor={editor}
        mark="italic"
        icon={Italic}
        label="Italic"
      />
      <FormatButton
        editor={editor}
        mark="underline"
        icon={Underline}
        label="Underline"
      />
      <FormatButton
        editor={editor}
        mark="strike"
        icon={Strikethrough}
        label="Strikethrough"
      />
      <LinkPopover editor={editor} variables={variables} />
    </div>
  );
}
