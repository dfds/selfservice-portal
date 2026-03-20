import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { TextAlign } from "@tiptap/extension-text-align";
import { Highlight } from "@tiptap/extension-highlight";
import { Typography } from "@tiptap/extension-typography";
import { useToast } from "@/context/ToastContext";
import { queryClient } from "@/state/remote/client";
import {
  useEmailCampaign,
  useCreateEmailCampaign,
  useUpdateEmailCampaign,
  usePreviewEmailCampaign,
  usePreviewEmailCampaignContent,
  useSendEmailCampaign,
  useScheduleEmailCampaign,
  useTemplateVariables,
} from "@/state/remote/queries/emailCampaigns";
import { TemplateVariableNode } from "./tiptap/template-variable-node";
import { VariableSuggestion } from "./tiptap/variable-suggestion";
import { VariableInserter } from "./components/variable-inserter";
import { AudienceBuilder } from "./components/audience-builder";
import { PreviewDialog } from "./components/preview-dialog";
import { SchedulePicker } from "./components/schedule-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Save, Eye, Send, CalendarClock } from "lucide-react";

interface AudienceConfig {
  mode: "all" | "specific" | "filter";
  capabilityIds?: string[];
  filters?: any[];
}

export default function EmailCampaignEditor() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  const { data: existingCampaign, isFetched } = useEmailCampaign(id || "");
  const { data: variables } = useTemplateVariables();
  const createCampaign = useCreateEmailCampaign();
  const updateCampaign = useUpdateEmailCampaign(id || "");
  const previewCampaign = usePreviewEmailCampaign(id || "");
  const previewContent = usePreviewEmailCampaignContent();
  const sendCampaign = useSendEmailCampaign(id || "");
  const scheduleCampaign = useScheduleEmailCampaign(id || "");

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
  const suggestionRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ suggestion, selectedIndex, filteredVars: [] as any[] });

  const handleSuggestionOpen = useCallback((query: string, from: number, to: number) => {
    setSuggestion({ active: true, query, from, to });
    setSelectedIndex(0);
  }, []);

  const handleSuggestionClose = useCallback(() => {
    setSuggestion({ active: false, query: "", from: 0, to: 0 });
  }, []);

  const handleSuggestionUpdate = useCallback((query: string, from: number, to: number) => {
    setSuggestion({ active: true, query, from, to });
    setSelectedIndex(0);
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: true }),
      Typography,
      TemplateVariableNode,
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
      handleKeyDown: (_view, event) => {
        const { suggestion: s, filteredVars: fv, selectedIndex: si } = stateRef.current;
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

  useEffect(() => {
    stateRef.current = { suggestion, selectedIndex, filteredVars };
  });

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

  useEffect(() => {
    if (isEdit && isFetched && existingCampaign && editor && !loaded) {
      setName(existingCampaign.name || "");
      setSubject(existingCampaign.subject || "");
      setRecipientFilter(existingCampaign.recipientFilter || "");
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
        contentHtml: editor.getHTML(),
        audienceJson: JSON.stringify(audience),
        recipientFilter: recipientFilter || null,
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
    doSave().then(() => {
      toast.success(isEdit ? "Campaign updated" : "Campaign created");
      navigate("/admin/email-campaigns");
    });
  };

  const handlePreview = () => {
    setPreviewLoading(true);
    setPreviewOpen(true);

    if (isEdit) {
      previewCampaign.mutate(
        { payload: {} },
        {
          onSuccess: (data: any) => {
            setPreviews(data?.previews || []);
            setPreviewLoading(false);
          },
          onError: () => {
            toast.error("Could not generate preview");
            setPreviewLoading(false);
          },
        },
      );
    } else {
      if (!editor) {
        setPreviewLoading(false);
        return;
      }
      previewContent.mutate(
        {
          payload: {
            contentJson: JSON.stringify(editor.getJSON()),
            contentHtml: editor.getHTML(),
            subject: subject.trim(),
            audienceJson: JSON.stringify(audience),
          },
        },
        {
          onSuccess: (data: any) => {
            setPreviews(data?.previews || []);
            setPreviewLoading(false);
          },
          onError: () => {
            toast.error("Could not generate preview");
            setPreviewLoading(false);
          },
        },
      );
    }
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

  const isDraft = !isEdit || existingCampaign?.status === "Draft";

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
        className="flex items-center gap-1.5 text-[12px] text-muted hover:text-secondary mb-4 cursor-pointer bg-transparent border-0 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to campaigns
      </button>

      <h1 className="text-[1.25rem] font-bold text-primary mb-6">
        {isEdit ? "Edit Campaign" : "New Campaign"}
      </h1>

      <div className="space-y-5">
        <div>
          <Label htmlFor="campaign-name" className="text-[12px] mb-1 block">
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
            className="text-[12px] mb-1 block"
          >
            Email Subject Line
          </Label>
          <Input
            id="campaign-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., Action Required: {{Capability.Name}} migration"
            disabled={!isDraft}
          />
          <span className="text-[11px] text-muted mt-1 block">
            Supports template variables like {"{{Capability.Name}}"}
          </span>
        </div>

        <div>
          <Label className="text-[12px] mb-2 block">Email Body</Label>
          <div className="border border-card rounded-lg overflow-hidden bg-surface relative">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-card bg-surface-subtle">
              <VariableInserter editor={editor} />
              <span className="text-[10px] text-muted ml-auto">
                Type <code className="bg-surface px-1 rounded text-[10px]">{"{{"}</code> to autocomplete
              </span>
            </div>
            <EditorContent editor={editor} />

            {suggestion.active && filteredVars.length > 0 && (
              <div
                ref={suggestionRef}
                className="absolute z-50 w-64 rounded-lg border border-card bg-surface shadow-overlay overflow-hidden animate-menu-enter"
                style={{ top: "52px", left: "16px" }}
              >
                <div className="max-h-48 overflow-y-auto p-1">
                  {filteredVars.map((v: any, i: number) => (
                    <button
                      key={v.name}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        insertSuggestion(v.name);
                      }}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left cursor-pointer border-0 bg-transparent transition-colors ${
                        i === selectedIndex
                          ? "bg-action/10 text-action"
                          : "hover:bg-[#f2f2f2] dark:hover:bg-slate-700"
                      }`}
                    >
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[10px] font-mono font-medium">
                        {v.name}
                      </span>
                      <span className="text-[10px] text-muted truncate">
                        {v.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <AudienceBuilder
          value={audience}
          onChange={setAudience}
          recipientFilter={recipientFilter}
          onRecipientFilterChange={isDraft ? setRecipientFilter : undefined}
        />

        <SchedulePicker
          scheduleType={scheduleType}
          scheduledAt={scheduledAt}
          cronExpression={cronExpression}
          onChange={({ scheduleType: st, scheduledAt: sa, cronExpression: ce }) => {
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
              disabled={
                createCampaign.isPending || updateCampaign.isPending
              }
              className="gap-1.5"
            >
              <Save size={14} />
              {isEdit ? "Save Changes" : "Create Draft"}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={previewCampaign.isPending || previewContent.isPending}
            className="gap-1.5"
          >
            <Eye size={14} />
            Preview
          </Button>
          {isEdit && isDraft && scheduleType !== "Immediate" && (
            <Button
              variant="action"
              onClick={handleSchedule}
              disabled={scheduleCampaign.isPending || updateCampaign.isPending}
              className="gap-1.5"
            >
              <CalendarClock size={14} />
              {updateCampaign.isPending ? "Saving..." : scheduleCampaign.isPending ? "Scheduling..." : "Schedule"}
            </Button>
          )}
          {isEdit && isDraft && scheduleType === "Immediate" && (
            <Button
              variant="destructive"
              onClick={() => setSendConfirmOpen(true)}
              disabled={updateCampaign.isPending}
              className="gap-1.5"
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
      />

      <Dialog open={sendConfirmOpen} onOpenChange={setSendConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send campaign now?</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-secondary">
            This will send <strong>{name}</strong> to all matching recipients
            immediately. This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => setSendConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSend}
              disabled={updateCampaign.isPending || sendCampaign.isPending}
              className="gap-1.5"
            >
              <Send size={14} />
              {updateCampaign.isPending ? "Saving..." : sendCampaign.isPending ? "Sending..." : "Send Now"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
