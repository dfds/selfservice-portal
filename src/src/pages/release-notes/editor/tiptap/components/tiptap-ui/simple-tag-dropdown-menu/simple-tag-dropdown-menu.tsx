import * as React from "react";
import { isNodeSelection, type Editor } from "@tiptap/react";

// --- Hooks ---
import { useTiptapEditor } from "../../../hooks/use-tiptap-editor";

// --- Icons ---
import { ChevronDownIcon } from "../../tiptap-icons/chevron-down-icon";
import { HeadingIcon } from "../../tiptap-icons/heading-icon";

// --- Lib ---
import { isMarkInSchema, isNodeInSchema } from "../../../lib/tiptap-utils";

// --- Tiptap UI ---
import {
  HeadingButton,
  headingIcons,
  type Level,
} from "../heading-button/heading-button";

// --- UI Primitives ---
import type { ButtonProps } from "../../tiptap-ui-primitive/button";
import { Button } from "../../tiptap-ui-primitive/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "../../tiptap-ui-primitive/dropdown-menu";
import {
  SimpleTagButton,
  getFormattedHeadingName,
} from "../simple-tag-colour-button";
import { TagIcon } from "../../tiptap-icons/tag-icon";

export interface HeadingDropdownMenuProps extends Omit<ButtonProps, "type"> {
  editor?: Editor | null;
  colours?: string[];
  hideWhenUnavailable?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export function SimpleTagDropdownMenu({
  editor: providedEditor,
  colours = ["blue", "green", "orange", "red", "yellow"],
  hideWhenUnavailable = false,
  onOpenChange,
  ...props
}: HeadingDropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const editor = useTiptapEditor(providedEditor);

  const headingInSchema = isMarkInSchema("simpleTag", editor);

  const handleOnOpenChange = React.useCallback(
    (open: boolean) => {
      setIsOpen(open);
      onOpenChange?.(open);
    },
    [onOpenChange],
  );

  const getActiveIcon = React.useCallback(() => {
    if (!editor) return <TagIcon className="tiptap-button-icon" />;

    const activeColour = colours.find((colour) =>
      editor.isActive("simpleTag", { bgColour: colour }),
    ) as string | undefined;

    if (!activeColour) return <TagIcon className="tiptap-button-icon" />;

    console.log(activeColour);
    return <TagIcon className={`tiptap-button-icon ${activeColour}`} />;
  }, [editor, colours]);

  const canToggleAnyHeading = React.useCallback((): boolean => {
    if (!editor) return false;
    return colours.some((colour) =>
      editor.can().toggleMark("simpleTag", { colour }),
    );
  }, [editor, colours]);

  const isDisabled = !canToggleAnyHeading();
  const isAnyHeadingActive = editor?.isActive("simpleTag") ?? false;

  const show = React.useMemo(() => {
    if (!headingInSchema || !editor) {
      return false;
    }

    if (hideWhenUnavailable) {
      if (isNodeSelection(editor.state.selection) || !canToggleAnyHeading()) {
        return false;
      }
    }

    return true;
  }, [headingInSchema, editor, hideWhenUnavailable, canToggleAnyHeading]);

  if (!show || !editor || !editor.isEditable) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOnOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          disabled={isDisabled}
          data-style="ghost"
          data-active-state={isAnyHeadingActive ? "on" : "off"}
          data-disabled={isDisabled}
          role="button"
          tabIndex={-1}
          aria-label="Format text as simple tag"
          aria-pressed={isAnyHeadingActive}
          tooltip="Simple tag"
          {...props}
        >
          {getActiveIcon()}
          <ChevronDownIcon className="tiptap-button-dropdown-small" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuGroup>
          {colours.map((colour) => (
            <DropdownMenuItem key={`heading-${colour}`} asChild>
              <SimpleTagButton
                editor={editor}
                colour={colour}
                text={getFormattedHeadingName(colour)}
                tooltip={""}
              />
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default SimpleTagDropdownMenu;
