import * as React from "react";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";
import { useNavigate } from "react-router-dom";

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Underline } from "@tiptap/extension-underline";

// --- Custom Extensions ---
import { Link } from "./tiptap/components/tiptap-extension/link-extension";
import { Selection } from "./tiptap/components/tiptap-extension/selection-extension";
import { TrailingNode } from "./tiptap/components/tiptap-extension/trailing-node-extension";

// --- UI Primitives ---
import { Button } from "./tiptap/components/tiptap-ui-primitive/button";
import { Spacer } from "./tiptap/components/tiptap-ui-primitive/spacer";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tiptap/components/tiptap-ui-primitive/tooltip";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "./tiptap/components/tiptap-ui-primitive/toolbar";

// --- Tiptap Node ---
import "./tiptap/components/tiptap-node/code-block-node/code-block-node.scss";
import "./tiptap/components/tiptap-node/list-node/list-node.scss";
import "./tiptap/components/tiptap-node/image-node/image-node.scss";
import "./tiptap/components/tiptap-node/paragraph-node/paragraph-node.scss";

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "./tiptap/components/tiptap-ui/heading-dropdown-menu";
import { SimpleTagDropdownMenu } from "./tiptap/components/tiptap-ui/simple-tag-dropdown-menu";
import { ListDropdownMenu } from "./tiptap/components/tiptap-ui/list-dropdown-menu";
import { BlockQuoteButton } from "./tiptap/components/tiptap-ui/blockquote-button";
import { CodeBlockButton } from "./tiptap/components/tiptap-ui/code-block-button";
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "./tiptap/components/tiptap-ui/color-highlight-popover";
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "./tiptap/components/tiptap-ui/link-popover";
import { MarkButton } from "./tiptap/components/tiptap-ui/mark-button";
import { TextAlignButton } from "./tiptap/components/tiptap-ui/text-align-button";
import { UndoRedoButton } from "./tiptap/components/tiptap-ui/undo-redo-button";

// --- Icons ---
import { ArrowLeftIcon } from "./tiptap/components/tiptap-icons/arrow-left-icon";
import { HighlighterIcon } from "./tiptap/components/tiptap-icons/highlighter-icon";
import { LinkIcon } from "./tiptap/components/tiptap-icons/link-icon";
import { ImagePlusIcon } from "./tiptap/components/tiptap-icons/image-plus-icon";

// --- Hooks ---
import { useMobile } from "./tiptap/hooks/use-mobile";
import { useCursorVisibility } from "./tiptap/hooks/use-cursor-visibility";

// --- Components ---
import { ThemeToggle } from "./tiptap/components/tiptap-templates/simple/theme-toggle";

// --- Lib ---
import { InlineImage } from "@/components/RichTextEditor/inline-image";
import { useRichTextImages } from "@/components/RichTextEditor/useRichTextImages";
import { serializeRichContent } from "@/lib/richContent";
import { PrivateAssetOwnerType } from "@/state/remote/queries/privateAssets";

// --- Styles ---
import "./tiptap/components/tiptap-templates/simple/simple-editor.scss";

// --- DFDS components ---
import { SimpleTag } from "./tiptap/components/simple-tag";

import content from "./tiptap/components/tiptap-templates/simple/data/content.json";
import { useState } from "react";
import { Input } from "./input";
import {
  useCreateReleaseNote,
  useUpdateReleaseNote,
} from "@/state/remote/queries/releaseNotes";
import { queryClient } from "@/state/remote/client";
import { DatePicker } from "./datepicker";
import { TrackedButton } from "@/components/Tracking";
import { useRybbit } from "@/RybbitContext";
import { useToast } from "@/context/ToastContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button as UiButton } from "@/components/ui/button";
import { Text } from "@/components/ui/Text";

function ControlTooltip({ disabled, reason, enabledLabel, children }: {
  disabled: boolean;
  reason: string;
  enabledLabel?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Tooltip open={open && (disabled || !!enabledLabel)} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <span
          className="inline-flex"
          tabIndex={disabled ? 0 : undefined}
          aria-label={disabled ? reason : undefined}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={(event) => {
            if (!event.currentTarget.contains(document.activeElement)) setOpen(false);
          }}
          onFocus={() => setOpen(true)}
          onBlur={(event) => {
            if (!event.currentTarget.matches(":hover")) setOpen(false);
          }}
          onPointerDown={(event) => {
            if (disabled && event.pointerType === "touch") event.currentTarget.focus();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
        >
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent>{disabled ? reason : enabledLabel}</TooltipContent>
    </Tooltip>
  );
}

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
  onInsertImage,
  imageDisabled,
  imageDisabledReason,
}: {
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  isMobile: boolean;
  onInsertImage: () => void;
  imageDisabled: boolean;
  imageDisabledReason: string;
}) => {
  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} />
        <ListDropdownMenu types={["bulletList", "orderedList", "taskList"]} />
        <BlockQuoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ControlTooltip disabled={imageDisabled} reason={imageDisabledReason} enabledLabel="Add image">
          <Button type="button" data-style="ghost" aria-label="Add image" className={imageDisabled ? "pointer-events-none" : undefined} disabled={imageDisabled} onClick={onInsertImage}>
            <ImagePlusIcon className="tiptap-button-icon" />
          </Button>
        </ControlTooltip>
        <SimpleTagDropdownMenu />
      </ToolbarGroup>

      <Spacer />

      {isMobile && <ToolbarSeparator />}

      <ToolbarGroup>
        <ThemeToggle />
      </ToolbarGroup>
    </>
  );
};

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link";
  onBack: () => void;
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
);

export enum EditorMode {
  Create,
  Edit,
  View,
}

export interface EditorProps {
  defaultContent?: any;
  mode?: EditorMode;
  doc?: any;
}

function WarningDialog({ onCloseRequested, onAccept }) {
  return (
    <Dialog open={true} onOpenChange={(o) => !o && onCloseRequested()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel edits</DialogTitle>
        </DialogHeader>
        <div>
          <Text styledAs={"smallHeadline"}>Are you certain?</Text>{" "}
          <span>All changes will be discarded and cannot be restored.</span>
        </div>
        <DialogFooter>
          <UiButton variant="outline" onClick={onCloseRequested}>
            Cancel
          </UiButton>
          <UiButton onClick={onAccept}>Accept</UiButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function Editor({ defaultContent, mode, doc }: EditorProps) {
  const navigate = useNavigate();
  const isMobile = useMobile();
  const [mobileView, setMobileView] = React.useState<
    "main" | "highlighter" | "link"
  >("main");
  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const [showDiscardWarning, setShowDiscardWarning] = useState(false);
  const [ownerId, setOwnerId] = useState<string | undefined>(doc?.id);
  const [title, setTitle] = useState(doc != null ? doc.title : "");
  const [releaseDate, setReleaseDate] = useState(
    doc != null ? new Date(doc.releaseDate).toISOString().split("T")[0] : "",
  );
  const initialMetadata = React.useRef({ title, releaseDate });
  const [currentContent, setCurrentContent] = useState<string | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<{ title: string; releaseDate: string; content: string } | null>(null);

  const editorContent = defaultContent != null ? defaultContent : content;
  const editable = mode !== EditorMode.View;

  const editor = useEditor({
    immediatelyRender: false,
    editable: editable,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
      },
    },
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      InlineImage,
      Typography,
      Superscript,
      Subscript,

      Selection,
      TrailingNode,
      Link.configure({ openOnClick: false }),
      SimpleTag,
    ],
    content: editorContent,
  });

  React.useEffect(() => {
    if (!editor) return;
    const readContent = () => setCurrentContent(serializeRichContent(editor.getJSON()));
    const initialContent = serializeRichContent(editor.getJSON());
    setCurrentContent(initialContent);
    setSavedSnapshot({ ...initialMetadata.current, content: initialContent });
    editor.on("update", readContent);
    return () => { editor.off("update", readContent); };
  }, [editor]);

  const images = useRichTextImages({
    editor,
    ownerId,
    ownerType: PrivateAssetOwnerType.ReleaseNote,
  });

  useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  });

  React.useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main");
    }
  }, [isMobile, mobileView]);

  const createReleaseNote = useCreateReleaseNote();
  const updateReleaseNote = useUpdateReleaseNote(ownerId || "0");
  const { trackEvent } = useRybbit();
  const toast = useToast();
  const isDirty = !!savedSnapshot && (title !== savedSnapshot.title || releaseDate !== savedSnapshot.releaseDate || currentContent !== savedSnapshot.content);
  const isSaving = createReleaseNote.isPending || updateReleaseNote.isPending;
  const titleMissing = !title?.trim();
  const dateMissing = !releaseDate;
  const saveDisabled = !editor || !savedSnapshot || !isDirty || titleMissing || dateMissing || images.uploading || isSaving;
  const saveDisabledReason = titleMissing && dateMissing
    ? "Release notes must have a title and release date"
    : titleMissing
      ? "Release notes must have a title"
      : dateMissing
        ? "Release notes must have a release date"
        : images.uploading
          ? "Wait for the image upload to finish"
          : isSaving
            ? "Saving release note"
            : "No changes to save";

  const handleOnSaveDraft = () => {
    if (!editor || saveDisabled) return;
    const snapshot = { title, releaseDate, content: serializeRichContent(editor.getJSON()) };
    createReleaseNote.mutate(
      {
        payload: {
          title: title,
          content: snapshot.content,
          releaseDate: new Date(releaseDate).toJSON(),
          isActive: false,
        },
      },
      {
        onSuccess: (data: any) => {
          setOwnerId(data.id);
          setSavedSnapshot(snapshot);
          toast.success("Release note saved");
          queryClient.invalidateQueries({ queryKey: ["releasenotes", "list"] });
          trackEvent("release-note:create:saved", { note_id: data?.id });
        },
        onError: handleSaveError,
      },
    );
  };

  const handleDiscard = () => {
    trackEvent("release-note:create:discarded", { mode: mode });
    navigate("/release-notes/manage");
  };

  const handleOnSave = () => {
    if (!editor || saveDisabled) return;
    const snapshot = { title, releaseDate, content: serializeRichContent(editor.getJSON()) };
    updateReleaseNote.mutate(
      {
        payload: {
          title: title,
          content: snapshot.content,
          releaseDate: new Date(releaseDate).toJSON(),
          isActive: false,
        },
      },
      {
        onSuccess: () => {
          setSavedSnapshot(snapshot);
          toast.success("Release note saved");
          queryClient.invalidateQueries({ queryKey: ["releasenotes", "list"] });
          queryClient.invalidateQueries({
            queryKey: ["releasenotes", "details", ownerId],
          });
          trackEvent("release-note:update:saved", { note_id: ownerId });
        },
        onError: handleSaveError,
      },
    );
  };

  const handleSaveError = (error: Error & { data?: Response }) => {
    const status = error.data?.status;
    toast.error(status === 401 || status === 403
      ? "Could not save the release note. Check your permissions or sign in again."
      : "Could not save the release note. Please try again.");
  };

  const handleTitleUpdate = (evt) => {
    setTitle(evt.target.value);
  };

  const handleReleaseDateUpdate = (evt) => {
    setReleaseDate(evt.target.value);
  };

  return (
    <>
      {showDiscardWarning && (
        <WarningDialog
          onCloseRequested={() => {
            setShowDiscardWarning(false);
          }}
          onAccept={() => {
            handleDiscard();
            setShowDiscardWarning(false);
          }}
        />
      )}
      <div className="editor-primary">
        <EditorContext.Provider value={{ editor }}>
          {mode !== EditorMode.View && (
            <div className="flex flex-row justify-end gap-2 mb-2.5">
              <ControlTooltip disabled={saveDisabled} reason={saveDisabledReason}>
                <TrackedButton
                  trackName="ReleaseNotes-Save"
                  disabled={saveDisabled}
                  className={saveDisabled ? "pointer-events-none" : undefined}
                  onClick={
                    ownerId ? handleOnSave : handleOnSaveDraft
                  }
                  trackingEvent={{
                    category: "ReleaseNotes",
                    action: "Save New",
                    label: "Save New Release Note",
                  }}
                >
                  {isSaving ? "Saving..." : "Save"}
                </TrackedButton>
              </ControlTooltip>
              <TrackedButton
                trackName={isDirty ? "ReleaseNotes-Discard" : "ReleaseNotes-Return"}
                variation={isDirty ? "danger" : undefined}
                disabled={isSaving}
                onClick={() => isDirty ? setShowDiscardWarning(true) : navigate("/release-notes/manage")}
                trackingEvent={{
                  category: "ReleaseNotes",
                  action: "Discard",
                  label: "Discard Release Note",
                }}
              >
                {isDirty ? "Discard" : "Return"}
              </TrackedButton>
            </div>
          )}

          {mode !== EditorMode.View && (
            <div>
              <div className="editor-metadata">
                <Input
                  label="Title"
                  placeholder="2025.06 - The big summer release"
                  onChange={handleTitleUpdate}
                  inputOverride={title}
                />
                <DatePicker
                  label="Release date"
                  placeholder="nah"
                  onChange={handleReleaseDateUpdate}
                  inputOverride={releaseDate}
                />
              </div>
              <Toolbar ref={toolbarRef}>
                {mobileView === "main" ? (
                  <MainToolbarContent
                    onHighlighterClick={() => setMobileView("highlighter")}
                    onLinkClick={() => setMobileView("link")}
                    isMobile={isMobile}
                    onInsertImage={images.insertImage}
                    imageDisabled={!ownerId || images.uploading}
                    imageDisabledReason={!ownerId ? "Save first, then edit to upload images" : "Image upload in progress"}
                  />
                ) : (
                  <MobileToolbarContent
                    type={mobileView === "highlighter" ? "highlighter" : "link"}
                    onBack={() => setMobileView("main")}
                  />
                )}
              </Toolbar>
              <input ref={images.inputRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp,.png,.jpg,.jpeg,.gif,.webp" className="hidden" onChange={images.onFileChange} />
              {images.uploading && <p role="status">Uploading image...</p>}
              {images.error && <p role="alert" className="text-red-500">{images.error}</p>}
            </div>
          )}

          <div className="content-wrapper">
            <EditorContent
              editor={editor}
              role="presentation"
              className="simple-editor-content"
            />
          </div>
        </EditorContext.Provider>
      </div>
    </>
  );
}
