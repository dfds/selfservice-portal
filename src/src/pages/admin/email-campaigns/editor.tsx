import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import { NodeSelection } from "@tiptap/pm/state";
import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { TextAlign } from "@tiptap/extension-text-align";
import { Highlight } from "@tiptap/extension-highlight";
import { Typography } from "@tiptap/extension-typography";
import { Link } from "@/pages/release-notes/editor/tiptap/components/tiptap-extension/link-extension";
import { useToast } from "@/context/ToastContext";
import { queryClient } from "@/state/remote/client";
import {
  useEmailCampaign,
  useCreateEmailCampaign,
  useUpdateEmailCampaign,
  usePreviewEmailCampaign,
  useSendEmailCampaign,
  useScheduleEmailCampaign,
  useTemplateVariables,
} from "@/state/remote/queries/emailCampaigns";
import { TemplateVariableNode } from "./tiptap/template-variable-node";
import { VariableSuggestion } from "./tiptap/variable-suggestion";
import { BlockHelperHighlight } from "./tiptap/block-helper-highlight";
import { VariableInserter } from "./components/variable-inserter";
import { FormattingToolbar } from "./components/formatting-toolbar";
import { AudienceBuilder } from "./components/audience-builder";
import { PreviewDialog } from "./components/preview-dialog";
import { SchedulePicker } from "./components/schedule-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Save,
  Eye,
  Send,
  CalendarClock,
  Repeat,
  Search,
} from "lucide-react";

type TargetType = "Capability" | "User";

interface AudienceConfig {
  mode: "all" | "specific" | "filter";
  // capabilityIds is used for Capability target; userEmails for User target.
  capabilityIds?: string[];
  userEmails?: string[];
  filters?: any[];
}

function preserveEmptyParagraphSpacing(html: string) {
  // Email clients often collapse truly empty paragraphs. Convert them to a
  // non-breaking space so blank lines remain visible in preview and sends.
  return html.replace(
    /<p(\s[^>]*)?>\s*(?:<br\s*\/?>)?\s*<\/p>/gi,
    "<p$1>&nbsp;</p>",
  );
}

export default function EmailCampaignEditor() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  // Track the campaign id in state so a freshly-created draft can transition to
  // edit-mode in place (without a route remount) — keeps the editor and any
  // open preview alive and routes subsequent saves through update, not create.
  const [campaignId, setCampaignId] = useState(id);
  const isEdit = !!campaignId;

  // Keyed on the original param id: only edit-mode (existing) campaigns load here.
  const { data: existingCampaign, isFetched } = useEmailCampaign(id || "");
  const [targetType, setTargetType] = useState<TargetType>("Capability");
  const { data: variables } = useTemplateVariables(targetType);
  const createCampaign = useCreateEmailCampaign();
  const updateCampaign = useUpdateEmailCampaign(campaignId || "");
  const previewCampaign = usePreviewEmailCampaign(campaignId || "");
  const sendCampaign = useSendEmailCampaign(campaignId || "");
  const scheduleCampaign = useScheduleEmailCampaign(campaignId || "");

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [audience, setAudience] = useState<AudienceConfig>({ mode: "all" });
  const [recipientFilter, setRecipientFilter] = useState("");
  const [loaded, setLoaded] = useState(!isEdit);

  const [scheduleType, setScheduleType] = useState<
    "Immediate" | "Scheduled" | "Recurring"
  >("Immediate");
  const [scheduledAt, setScheduledAt] = useState("");
  const [cronExpression, setCronExpression] = useState("");

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previews, setPreviews] = useState<any[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [sendConfirmOpen, setSendConfirmOpen] = useState(false);

  // Autocomplete state
  const [suggestion, setSuggestion] = useState<{
    active: boolean;
    query: string;
    from: number;
    to: number;
  }>({ active: false, query: "", from: 0, to: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  // Position of the autocomplete dropdown, anchored just below the caret so it
  // never covers the text being typed. Falls back to the top-left corner.
  const [suggestionPos, setSuggestionPos] = useState<{ x: number; y: number }>({
    x: 16,
    y: 52,
  });
  const suggestionRef = useRef<HTMLDivElement>(null);
  const editorWrapRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    suggestion,
    selectedIndex,
    filteredVars: [] as any[],
  });

  // Click-to-swap popover: clicking a variable chip selects it and opens a
  // small list to replace it in place (atom nodes can't be edited inline).
  const [replacePopover, setReplacePopover] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [replaceSearch, setReplaceSearch] = useState("");
  const previewAfterCreateHandledRef = useRef<string | null>(null);

  const handleSuggestionOpen = useCallback(
    (query: string, from: number, to: number) => {
      setSuggestion({ active: true, query, from, to });
      setSelectedIndex(0);
    },
    [],
  );

  const handleSuggestionClose = useCallback(() => {
    setSuggestion({ active: false, query: "", from: 0, to: 0 });
  }, []);

  const handleSuggestionUpdate = useCallback(
    (query: string, from: number, to: number) => {
      setSuggestion({ active: true, query, from, to });
      setSelectedIndex(0);
    },
    [],
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: true }),
      Typography,
      Link.configure({ openOnClick: false }),
      TemplateVariableNode,
      BlockHelperHighlight,
      VariableSuggestion.configure({
        onOpen: handleSuggestionOpen,
        onClose: handleSuggestionClose,
        onUpdate: handleSuggestionUpdate,
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[300px] px-4 py-3",
      },
      handleClickOn: (view, _pos, node, nodePos, event) => {
        if (node.type.name !== "templateVariable") return false;
        // Select the clicked chip so a subsequent insert replaces it in place.
        view.dispatch(
          view.state.tr.setSelection(
            NodeSelection.create(view.state.doc, nodePos),
          ),
        );
        const wrap = editorWrapRef.current;
        const chip = (event.target as HTMLElement)?.closest(
          ".template-variable-chip",
        ) as HTMLElement | null;
        if (wrap && chip) {
          const wr = wrap.getBoundingClientRect();
          const cr = chip.getBoundingClientRect();
          setReplaceSearch("");
          setReplacePopover({
            x: cr.left - wr.left,
            y: cr.bottom - wr.top + 4,
          });
        }
        return true;
      },
      handleKeyDown: (_view, event) => {
        const {
          suggestion: s,
          filteredVars: fv,
          selectedIndex: si,
        } = stateRef.current;
        if (!s.active) return false;
        if (event.key === "ArrowDown") {
          event.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, fv.length - 1));
          return true;
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          return true;
        }
        if (event.key === "Enter" || event.key === "Tab") {
          if (fv.length > 0) {
            event.preventDefault();
            insertSuggestion(fv[si]?.name);
            return true;
          }
        }
        if (event.key === "Escape") {
          event.preventDefault();
          handleSuggestionClose();
          return true;
        }
        return false;
      },
    },
  });

  const filteredVars = (variables || []).filter((v: any) =>
    v.name.toLowerCase().includes(suggestion.query.toLowerCase()),
  );

  // Group by entity for display (matching the Insert Variable menu). `orderedVars`
  // is the same set flattened in display order so keyboard nav highlights the
  // visually-correct row.
  const groupedFilteredVars = (filteredVars as any[]).reduce(
    (acc: Record<string, any[]>, v: any) => {
      (acc[v.entity] ||= []).push(v);
      return acc;
    },
    {} as Record<string, any[]>,
  );
  const orderedVars = Object.values(groupedFilteredVars).flat();

  useEffect(() => {
    stateRef.current = {
      suggestion,
      selectedIndex,
      filteredVars: orderedVars,
    };
  });

  // Anchor the autocomplete dropdown below the caret (clamped to the editor
  // box) so it doesn't obscure what the user is typing.
  useEffect(() => {
    if (!suggestion.active || !editor) return;
    const wrap = editorWrapRef.current;
    if (!wrap) return;
    try {
      const coords = editor.view.coordsAtPos(suggestion.to);
      const wr = wrap.getBoundingClientRect();
      const POPUP_WIDTH = 384; // w-96
      const x = Math.max(
        8,
        Math.min(coords.left - wr.left, wr.width - POPUP_WIDTH - 8),
      );
      const y = coords.bottom - wr.top + 6;
      setSuggestionPos({ x, y });
    } catch {
      // coordsAtPos can throw mid-transaction; keep the previous position.
    }
  }, [suggestion.active, suggestion.from, suggestion.to, editor]);

  const insertSuggestion = useCallback(
    (varName: string) => {
      if (!editor || !varName) return;

      // Delete the typed "{{query" text, then insert the variable node
      editor
        .chain()
        .focus()
        .deleteRange({ from: suggestion.from, to: suggestion.to })
        .insertTemplateVariable(varName)
        .run();

      handleSuggestionClose();
    },
    [editor, suggestion.from, suggestion.to, handleSuggestionClose],
  );

  // Drops a ready-made {{#each User.Capabilities}} … {{/each}} loop with a
  // Capability.Name chip in the body, so authors don't type the markers by hand.
  const insertCapabilitiesLoop = useCallback(() => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertContent([
        {
          type: "paragraph",
          content: [{ type: "text", text: "{{#each User.Capabilities}}" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "templateVariable",
              attrs: { variableName: "Capability.Name" },
            },
          ],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "{{/each}}" }],
        },
      ])
      .run();
  }, [editor]);

  // Replaces the currently node-selected variable chip with a different one.
  const applyReplace = useCallback(
    (varName: string) => {
      if (!editor || !varName) return;
      editor.chain().focus().insertTemplateVariable(varName).run();
      setReplacePopover(null);
      setReplaceSearch("");
    },
    [editor],
  );

  const replaceVars = (variables || []).filter(
    (v: any) =>
      v.name.toLowerCase().includes(replaceSearch.toLowerCase()) ||
      (v.description || "").toLowerCase().includes(replaceSearch.toLowerCase()),
  );
  const groupedReplaceVars = (replaceVars as any[]).reduce(
    (acc: Record<string, any[]>, v: any) => {
      (acc[v.entity] ||= []).push(v);
      return acc;
    },
    {} as Record<string, any[]>,
  );

  useEffect(() => {
    if (isEdit && isFetched && existingCampaign && editor && !loaded) {
      setName(existingCampaign.name || "");
      setSubject(existingCampaign.subject || "");
      setRecipientFilter(existingCampaign.recipientFilter || "");
      setTargetType(
        existingCampaign.targetType === "User" ? "User" : "Capability",
      );
      setScheduleType(existingCampaign.scheduleType || "Immediate");
      if (existingCampaign.scheduledAt) {
        const dt = new Date(existingCampaign.scheduledAt);
        setScheduledAt(dt.toISOString().slice(0, 16));
      }
      setCronExpression(existingCampaign.cronExpression || "");
      try {
        const audienceData =
          typeof existingCampaign.audienceJson === "string"
            ? JSON.parse(existingCampaign.audienceJson)
            : existingCampaign.audienceJson;
        setAudience(audienceData || { mode: "all" });
      } catch {
        setAudience({ mode: "all" });
      }
      try {
        const content = JSON.parse(existingCampaign.contentJson);
        editor.commands.setContent(content);
      } catch {
        editor.commands.setContent(existingCampaign.contentJson || "");
      }
      setLoaded(true);
    }
  }, [isEdit, isFetched, existingCampaign, editor, loaded]);

  const doSave = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!editor) return reject(new Error("Editor not ready"));
      if (!name.trim() || !subject.trim()) {
        toast.error("Name and subject are required");
        return reject(new Error("Validation failed"));
      }

      const payload = {
        name: name.trim(),
        subject: subject.trim(),
        contentJson: JSON.stringify(editor.getJSON()),
        contentHtml: preserveEmptyParagraphSpacing(editor.getHTML()),
        audienceJson: JSON.stringify(audience),
        recipientFilter: recipientFilter || null,
        targetType,
        scheduleType,
        scheduledAt:
          scheduleType === "Scheduled" && scheduledAt
            ? new Date(scheduledAt).toISOString()
            : null,
        cronExpression:
          scheduleType === "Recurring" ? cronExpression.trim() || null : null,
      };

      const mutation = isEdit ? updateCampaign : createCampaign;

      mutation.mutate(
        { payload },
        {
          onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["emailCampaigns"] });
            // On a fresh create, adopt the new id in place: transition to
            // edit-mode without remounting the route (so the editor and any
            // open preview survive) and so the next save updates instead of
            // creating a duplicate draft.
            if (!isEdit && data?.id) {
              setCampaignId(data.id);
              window.history.replaceState(
                null,
                "",
                `/admin/email-campaigns/edit/${data.id}`,
              );
            }
            resolve(data);
          },
          onError: (err: any) => {
            toast.error("Could not save campaign");
            reject(err);
          },
        },
      );
    });
  };

  const handleSave = () => {
    const wasEdit = isEdit;
    doSave()
      .then(() => {
        toast.success(wasEdit ? "Campaign updated" : "Campaign created");
        // Stay in the editor — the "Back to campaigns" link and "Cancel"
        // button remain the explicit ways to leave.
      })
      .catch(() => { });
  };

  const waitForPreviewRetry = (ms: number) =>
    new Promise((resolve) => window.setTimeout(resolve, ms));

  const requestPreview = async (id: string | undefined, attempts = 1) => {
    let lastError: unknown;

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        return await previewCampaign.mutateAsync({ id, payload: {} });
      } catch (error) {
        lastError = error;
        if (attempt < attempts - 1) {
          await waitForPreviewRetry(300 * (attempt + 1));
        }
      }
    }

    throw lastError;
  };

  useEffect(() => {
    const shouldOpenPreview = (location.state as any)?.openPreviewAfterCreate;

    if (!shouldOpenPreview || !campaignId || !loaded) {
      return;
    }

    if (previewAfterCreateHandledRef.current === campaignId) {
      return;
    }

    previewAfterCreateHandledRef.current = campaignId;
    setPreviewLoading(true);
    setPreviews([]);
    setPreviewOpen(true);

    requestPreview(campaignId, 3)
      .then((data: any) => {
        setPreviews(data?.previews || []);
        setPreviewLoading(false);
      })
      .catch(() => {
        toast.error("Could not generate preview");
        setPreviewLoading(false);
      })
      .finally(() => {
        navigate(location.pathname, { replace: true, state: null });
      });
  }, [campaignId, loaded, location.pathname, location.state, navigate, toast]);

  // Preview always renders the freshly-saved record so it reflects current
  // edits. We save first, then preview by the saved id (passing it through the
  // mutate payload covers the brand-new-draft case before the editor re-renders).
  const handlePreview = () => {
    const previewAttempts = isEdit ? 1 : 3;
    doSave()
      .then((saved: any) => {
        if (!isEdit && saved?.id) {
          navigate(`/admin/email-campaigns/edit/${saved.id}`, {
            replace: true,
            state: { openPreviewAfterCreate: true },
          });
          return;
        }

        setPreviewLoading(true);
        setPreviews([]);
        setPreviewOpen(true);

        requestPreview(saved?.id, previewAttempts)
          .then((data: any) => {
            setPreviews(data?.previews || []);
            setPreviewLoading(false);
          })
          .catch(() => {
            toast.error("Could not generate preview");
            setPreviewLoading(false);
          });
      })
      .catch(() => { });
  };

  const handleSchedule = () => {
    if (scheduleType === "Scheduled" && !scheduledAt) {
      toast.error("Please select a date and time");
      return;
    }
    if (scheduleType === "Recurring" && !cronExpression.trim()) {
      toast.error("Please enter a cron expression");
      return;
    }

    doSave().then(() => {
      const payload: any = { scheduleType };
      if (scheduleType === "Scheduled") {
        payload.scheduledAt = new Date(scheduledAt).toISOString();
      }
      if (scheduleType === "Recurring") {
        payload.cronExpression = cronExpression.trim();
      }

      scheduleCampaign.mutate(
        { payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["emailCampaigns"] });
            toast.success("Campaign scheduled");
            navigate("/admin/email-campaigns");
          },
          onError: () => toast.error("Could not schedule campaign"),
        },
      );
    });
  };

  const handleSend = () => {
    doSave()
      .then(() => {
        sendCampaign.mutate(undefined, {
          onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["emailCampaigns"] });
            toast.success(
              `Campaign sent to ${data?.totalRecipients || 0} recipients`,
            );
            setSendConfirmOpen(false);
            navigate("/admin/email-campaigns");
          },
          onError: () => {
            toast.error("Could not send campaign");
            setSendConfirmOpen(false);
          },
        });
      })
      .catch(() => {
        setSendConfirmOpen(false);
      });
  };

  // A loaded campaign uses its own status; a new or just-created one is a Draft.
  const isDraft = existingCampaign ? existingCampaign.status === "Draft" : true;

  if (isEdit && !isFetched) {
    return (
      <div className="px-5 md:px-8 py-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="px-5 md:px-8 py-6">
      <button
        type="button"
        onClick={() => navigate("/admin/email-campaigns")}
        className="flex items-center gap-1.5 text-[0.75rem] text-muted hover:text-secondary mb-4 cursor-pointer bg-transparent border-0 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to campaigns
      </button>

      <h1 className="text-[1.25rem] font-bold text-primary mb-6">
        {isEdit ? "Edit Campaign" : "New Campaign"}
      </h1>

      <div className="space-y-5">
        <div>
          <Label className="text-[0.75rem] mb-1 block">Target Type</Label>
          <div className="flex gap-2">
            {(["Capability", "User"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  if (!isEdit && t !== targetType) {
                    setTargetType(t);
                    // Resetting the audience avoids carrying a filter shape
                    // that doesn't apply to the new target type.
                    setAudience({ mode: "all" });
                    setRecipientFilter("");
                  }
                }}
                disabled={isEdit}
                className={`px-3 py-1.5 rounded-md text-[0.75rem] font-medium border transition-colors ${targetType === t
                  ? "bg-[#002b45] text-white border-[#002b45] dark:bg-slate-600 dark:border-slate-500"
                  : "bg-transparent text-secondary border-card hover:bg-white dark:hover:bg-slate-700"
                  } ${isEdit ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                  }`}
              >
                {t === "Capability" ? "Capabilities" : "Users"}
              </button>
            ))}
          </div>
          <span className="text-[0.6875rem] text-muted mt-1 block">
            Determines who receives the email and which template variables are
            available. Cannot be changed after the campaign is created.
          </span>
        </div>

        <div>
          <Label htmlFor="campaign-name" className="text-[0.75rem] mb-1 block">
            Campaign Name
          </Label>
          <Input
            id="campaign-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Q1 Migration Notice"
            disabled={!isDraft}
          />
        </div>

        <div>
          <Label
            htmlFor="campaign-subject"
            className="text-[0.75rem] mb-1 block"
          >
            Email Subject Line
          </Label>
          <Input
            id="campaign-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={
              targetType === "User"
                ? "e.g., Hi {{User.DisplayName}}, an update on your capabilities"
                : "e.g., Action Required: {{Capability.Name}} migration"
            }
            disabled={!isDraft}
          />
          <span className="text-[0.6875rem] text-muted mt-1 block">
            Supports template variables like{" "}
            {targetType === "User"
              ? "{{User.DisplayName}}"
              : "{{Capability.Name}}"}
          </span>
        </div>

        <div>
          <Label className="text-[0.75rem] mb-2 block">Email Body</Label>
          <div
            ref={editorWrapRef}
            className="border border-card rounded-lg bg-surface relative"
          >
            <div className="flex items-center gap-1 px-3 py-2 border-b border-card bg-surface-subtle rounded-t-lg">
              <FormattingToolbar editor={editor} variables={variables || []} />
              <Separator orientation="vertical" className="mx-1.5 h-5" />
              <VariableInserter editor={editor} targetType={targetType} />
              {targetType === "User" && (
                <button
                  type="button"
                  onClick={insertCapabilitiesLoop}
                  title="Insert a {{#each User.Capabilities}} … {{/each}} loop"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[0.75rem] font-medium border border-card bg-surface hover:bg-white dark:hover:bg-slate-700 text-secondary cursor-pointer transition-colors"
                >
                  <Repeat size={12} />
                  Capabilities loop
                </button>
              )}
              <span className="text-[0.625rem] text-muted ml-auto">
                Type{" "}
                <code className="bg-surface px-1 rounded text-[0.625rem]">
                  {"{{"}
                </code>{" "}
                to autocomplete
              </span>
            </div>
            <EditorContent editor={editor} />

            {suggestion.active && filteredVars.length > 0 && (
              <div
                ref={suggestionRef}
                className="absolute z-50 w-96 rounded-lg border border-card bg-surface shadow-overlay overflow-hidden animate-menu-enter"
                style={{ top: suggestionPos.y, left: suggestionPos.x }}
              >
                <div className="max-h-80 overflow-y-auto p-1">
                  {Object.entries(groupedFilteredVars).map(([entity, vars]) => (
                    <div key={entity}>
                      <div className="px-2 py-1 text-[0.625rem] font-semibold tracking-wider uppercase text-muted font-mono">
                        {entity}
                      </div>
                      {(vars as any[]).map((v: any) => {
                        const i = orderedVars.indexOf(v);
                        return (
                          <button
                            key={v.name}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              insertSuggestion(v.name);
                            }}
                            className={`w-full flex flex-col items-start gap-1 px-2 py-2 rounded-md text-left cursor-pointer border-0 bg-transparent transition-colors ${i === selectedIndex
                              ? "bg-action/10"
                              : "hover:bg-[#f2f2f2] dark:hover:bg-slate-700"
                              }`}
                          >
                            <span className="flex items-center gap-2">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[0.6875rem] font-mono font-medium">
                                {`{{${v.name}}}`}
                              </span>
                              {targetType === "User" &&
                                v.scope === "perCapability" && (
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
                                <span className="font-mono">{v.example}</span>
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {replacePopover && (
              <>
                <button
                  type="button"
                  aria-label="Close variable picker"
                  className="fixed inset-0 z-40 cursor-default bg-transparent border-0"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setReplacePopover(null);
                  }}
                />
                <div
                  className="absolute z-50 w-80 rounded-lg border border-card bg-surface shadow-overlay overflow-hidden animate-menu-enter"
                  style={{ top: replacePopover.y, left: replacePopover.x }}
                >
                  <div className="p-2 border-b border-card">
                    <div className="relative">
                      <Search
                        size={13}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
                      />
                      <input
                        type="text"
                        value={replaceSearch}
                        onChange={(e) => setReplaceSearch(e.target.value)}
                        placeholder="Replace with..."
                        className="w-full h-8 pl-8 pr-3 rounded-md border border-card bg-surface text-[0.75rem] text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-action"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto p-1">
                    {replaceVars.length === 0 ? (
                      <div className="px-3 py-4 text-center text-muted text-[0.75rem]">
                        No variables found
                      </div>
                    ) : (
                      Object.entries(groupedReplaceVars).map(
                        ([entity, vars]) => (
                          <div key={entity}>
                            <div className="px-2 py-1 text-[0.625rem] font-semibold tracking-wider uppercase text-muted font-mono">
                              {entity}
                            </div>
                            {(vars as any[]).map((v: any) => (
                              <button
                                key={v.name}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  applyReplace(v.name);
                                }}
                                className="w-full flex flex-col items-start gap-1 px-2 py-2 rounded-md text-left hover:bg-[#f2f2f2] dark:hover:bg-slate-700 cursor-pointer border-0 bg-transparent transition-colors"
                              >
                                <span className="flex items-center gap-2">
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[0.6875rem] font-mono font-medium">
                                    {`{{${v.name}}}`}
                                  </span>
                                  {targetType === "User" &&
                                    v.scope === "perCapability" && (
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
                              </button>
                            ))}
                          </div>
                        ),
                      )
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <AudienceBuilder
          value={audience}
          onChange={setAudience}
          targetType={targetType}
          recipientFilter={recipientFilter}
          onRecipientFilterChange={isDraft ? setRecipientFilter : undefined}
        />

        <SchedulePicker
          scheduleType={scheduleType}
          scheduledAt={scheduledAt}
          cronExpression={cronExpression}
          onChange={({
            scheduleType: st,
            scheduledAt: sa,
            cronExpression: ce,
          }) => {
            setScheduleType(st);
            setScheduledAt(sa);
            setCronExpression(ce);
          }}
          disabled={!isDraft}
        />

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/email-campaigns")}
          >
            Cancel
          </Button>
          {isDraft && (
            <Button
              variant="action"
              onClick={handleSave}
              disabled={createCampaign.isPending || updateCampaign.isPending}
              className="gap-1.5"
            >
              <Save size={14} />
              {isEdit ? "Save Changes" : "Create Draft"}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={
              previewCampaign.isPending ||
              createCampaign.isPending ||
              updateCampaign.isPending
            }
            className="gap-1.5"
          >
            <Eye size={14} />
            Save and Preview
          </Button>
          {isEdit && isDraft && scheduleType !== "Immediate" && (
            <Button
              variant="action"
              onClick={handleSchedule}
              disabled={scheduleCampaign.isPending || updateCampaign.isPending}
              className="gap-1.5"
            >
              <CalendarClock size={14} />
              {updateCampaign.isPending
                ? "Saving..."
                : scheduleCampaign.isPending
                  ? "Scheduling..."
                  : "Schedule"}
            </Button>
          )}
          {isEdit && isDraft && scheduleType === "Immediate" && (
            <Button
              variant="destructive"
              onClick={() => setSendConfirmOpen(true)}
              disabled={updateCampaign.isPending}
              className="gap-1.5 ml-auto"
            >
              <Send size={14} />
              Send Now
            </Button>
          )}
        </div>
      </div>

      <PreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        previews={previews}
        loading={previewLoading}
        targetType={targetType}
      />

      <Dialog open={sendConfirmOpen} onOpenChange={setSendConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send campaign now?</DialogTitle>
          </DialogHeader>
          <p className="text-[0.8125rem] text-secondary">
            This will send <strong>{name}</strong> to all matching recipients
            immediately. This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setSendConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSend}
              disabled={updateCampaign.isPending || sendCampaign.isPending}
              className="gap-1.5"
            >
              <Send size={14} />
              {updateCampaign.isPending
                ? "Saving..."
                : sendCampaign.isPending
                  ? "Sending..."
                  : "Send Now"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
