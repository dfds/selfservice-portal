import * as React from "react";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
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
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "./tiptap/components/tiptap-ui-primitive/toolbar";

// --- Tiptap Node ---
import { ImageUploadNode } from "./tiptap/components/tiptap-node/image-upload-node/image-upload-node-extension";
import "./tiptap/components/tiptap-node/code-block-node/code-block-node.scss";
import "./tiptap/components/tiptap-node/list-node/list-node.scss";
import "./tiptap/components/tiptap-node/image-node/image-node.scss";
import "./tiptap/components/tiptap-node/paragraph-node/paragraph-node.scss";

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "./tiptap/components/tiptap-ui/heading-dropdown-menu";
import { SimpleTagDropdownMenu } from "./tiptap/components/tiptap-ui/simple-tag-dropdown-menu";
import { ImageUploadButton } from "./tiptap/components/tiptap-ui/image-upload-button";
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

// --- Hooks ---
import { useMobile } from "./tiptap/hooks/use-mobile";
import { useWindowSize } from "./tiptap/hooks/use-window-size";
import { useCursorVisibility } from "./tiptap/hooks/use-cursor-visibility";

// --- Components ---
import { ThemeToggle } from "./tiptap/components/tiptap-templates/simple/theme-toggle";

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "./tiptap/lib/tiptap-utils";

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

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
}: {
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  isMobile: boolean;
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
        <ImageUploadButton text="Add" />
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

export function Editor({ defaultContent, mode, doc }: EditorProps) {
  const isMobile = useMobile();
  const windowSize = useWindowSize();
  const [mobileView, setMobileView] = React.useState<
    "main" | "highlighter" | "link"
  >("main");
  const toolbarRef = React.useRef<HTMLDivElement>(null);

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
      Image,
      Typography,
      Superscript,
      Subscript,

      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
      TrailingNode,
      Link.configure({ openOnClick: false }),
      SimpleTag,
    ],
    content: editorContent,
  });

  const bodyRect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  });

  React.useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main");
    }
  }, [isMobile, mobileView]);

  // release notes
  const [title, setTitle] = useState(doc != null ? doc.title : "");
  const [releaseDate, setReleaseDate] = useState(
    doc != null ? new Date(doc.releaseDate).toISOString().split("T")[0] : "",
  );

  const createReleaseNote = useCreateReleaseNote();
  const updateReleaseNote = useUpdateReleaseNote(doc != null ? doc.id : "0");

  const handleOnSaveDraft = () => {
    console.log(editor.getJSON());
    createReleaseNote.mutate(
      {
        payload: {
          title: title,
          content: JSON.stringify(editor.getJSON()),
          releaseDate: new Date().toJSON(),
          isActive: false,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["releasenotes", "list"] });
        },
      },
    );
  };

  const handleOnSave = () => {
    updateReleaseNote.mutate(
      {
        payload: {
          title: title,
          content: JSON.stringify(editor.getJSON()),
          releaseDate: new Date(releaseDate).toJSON(),
          isActive: false,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["releasenotes", "list"] });
          queryClient.invalidateQueries({
            queryKey: ["releasenotes", "details", doc.id],
          });
        },
      },
    );
  };

  const handleTitleUpdate = (evt) => {
    setTitle(evt.target.value);
  };

  const handleReleaseDateUpdate = (evt) => {
    setReleaseDate(evt.target.value);
  };

  return (
    <div className="editor-primary">
      <EditorContext.Provider value={{ editor }}>
        {mode !== EditorMode.View && (
          <div className="editor-menu">
            {mode === EditorMode.Create ? (
              <div className="button" onClick={handleOnSaveDraft}>
                Save draft
              </div>
            ) : (
              <div className="button" onClick={handleOnSave}>
                Save
              </div>
            )}

            <div className="button" style={{ backgroundColor: "#dd6868" }}>
              Discard
            </div>

            {mode === EditorMode.Edit && (
              <div className="button" style={{ backgroundColor: "#dd6868" }}>
                Delete
              </div>
            )}
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
            <Toolbar
              ref={toolbarRef}
              style={
                isMobile
                  ? {
                      bottom: `calc(100% - ${
                        windowSize.height - bodyRect.y
                      }px)`,
                    }
                  : {}
              }
            >
              {mobileView === "main" ? (
                <MainToolbarContent
                  onHighlighterClick={() => setMobileView("highlighter")}
                  onLinkClick={() => setMobileView("link")}
                  isMobile={isMobile}
                />
              ) : (
                <MobileToolbarContent
                  type={mobileView === "highlighter" ? "highlighter" : "link"}
                  onBack={() => setMobileView("main")}
                />
              )}
            </Toolbar>
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
  );
}
