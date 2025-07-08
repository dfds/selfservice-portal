import * as React from "react";
import { isNodeSelection, type Editor } from "@tiptap/react";

// --- Hooks ---
import { useTiptapEditor } from "../../../hooks/use-tiptap-editor";

// --- Icons ---
import { HeadingOneIcon } from "../../tiptap-icons/heading-one-icon";
import { HeadingTwoIcon } from "../../tiptap-icons/heading-two-icon";
import { HeadingThreeIcon } from "../../tiptap-icons/heading-three-icon";
import { HeadingFourIcon } from "../../tiptap-icons/heading-four-icon";
import { HeadingFiveIcon } from "../../tiptap-icons/heading-five-icon";
import { HeadingSixIcon } from "../../tiptap-icons/heading-six-icon";

// --- Lib ---
import { isMarkInSchema, isNodeInSchema } from "../../../lib/tiptap-utils";

// --- UI Primitives ---
import type { ButtonProps } from "../../tiptap-ui-primitive/button";
import { Button } from "../../tiptap-ui-primitive/button";

export interface HeadingButtonProps extends Omit<ButtonProps, "type"> {
  /**
   * The TipTap editor instance.
   */
  editor?: Editor | null;
  /**
   * The heading level.
   */
  colour: string;
  /**
   * Optional text to display alongside the icon.
   */
  text?: string;
  /**
   * Whether the button should hide when the heading is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean;
}

export const headingIcons = {
  blue: HeadingOneIcon,
  green: HeadingTwoIcon,
  orange: HeadingThreeIcon,
  red: HeadingFourIcon,
  yellow: HeadingFiveIcon,
  6: HeadingSixIcon,
};

export const headingShortcutKeys: Partial<Record<string, string>> = {
  blue: "Ctrl-Alt-1",
  green: "Ctrl-Alt-2",
  orange: "Ctrl-Alt-3",
  red: "Ctrl-Alt-4",
  yellow: "Ctrl-Alt-5",
  6: "Ctrl-Alt-6",
};

export function canToggleHeading(
  editor: Editor | null,
  colour: string,
): boolean {
  if (!editor) return false;

  try {
    return editor.can().toggleNode("paragraph", "text", { colour });
  } catch {
    return false;
  }
}

export function isHeadingActive(
  editor: Editor | null,
  colour: string | null,
): boolean {
  if (!editor) return false;
  return editor.isActive("simpleTag", { colour });
}

export function toggleHeading(editor: Editor | null, colour: string): void {
  if (!editor) return;

  console.log(colour);

  if (editor.isActive("simpleTag", { bgColour: colour })) {
    editor.chain().focus().setMark("simpleTag", { bgColour: colour }).run();
    // editor.chain().focus().setMark("simpleTag", { colour: colour }).run();
  } else {
    editor.chain().focus().toggleMark("simpleTag", { bgColour: colour }).run();
    // editor.chain().focus().toggleMark("simpleTag", { colour: colour }).run();
  }
}

export function isHeadingButtonDisabled(
  editor: Editor | null,
  colour: string,
  userDisabled: boolean = false,
): boolean {
  if (!editor) return true;
  if (userDisabled) return true;
  if (!canToggleHeading(editor, colour)) return true;
  return false;
}

export function shouldShowHeadingButton(params: {
  editor: Editor | null;
  colour: string;
  hideWhenUnavailable: boolean;
  headingInSchema: boolean;
}): boolean {
  const { editor, hideWhenUnavailable, headingInSchema } = params;

  if (!headingInSchema || !editor) {
    return false;
  }

  if (hideWhenUnavailable) {
    if (isNodeSelection(editor.state.selection)) {
      return false;
    }
  }

  return true;
}

export function getFormattedHeadingName(colour: string): string {
  return `Colour ${colour}`;
}

export function useHeadingState(
  editor: Editor | null,
  colour: string,
  disabled: boolean = false,
) {
  const headingInSchema = isMarkInSchema("simpleTag", editor);
  const isDisabled = isHeadingButtonDisabled(editor, colour, disabled);
  const isActive = isHeadingActive(editor, colour);

  const Icon = headingIcons[colour];
  const shortcutKey = headingShortcutKeys[colour];
  const formattedName = getFormattedHeadingName(colour);

  return {
    headingInSchema,
    isDisabled,
    isActive,
    Icon,
    shortcutKey,
    formattedName,
  };
}

export const SimpleTagButton = React.forwardRef<
  HTMLButtonElement,
  HeadingButtonProps
>(
  (
    {
      editor: providedEditor,
      colour,
      text,
      hideWhenUnavailable = false,
      className = "",
      disabled,
      onClick,
      children,
      ...buttonProps
    },
    ref,
  ) => {
    const editor = useTiptapEditor(providedEditor);

    const {
      headingInSchema,
      isDisabled,
      isActive,
      Icon,
      shortcutKey,
      formattedName,
    } = useHeadingState(editor, colour, disabled);

    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);

        if (!e.defaultPrevented && !isDisabled && editor) {
          toggleHeading(editor, colour);
        }
      },
      [onClick, isDisabled, editor, colour],
    );

    const show = React.useMemo(() => {
      return shouldShowHeadingButton({
        editor,
        colour,
        hideWhenUnavailable,
        headingInSchema,
      });
    }, [editor, colour, hideWhenUnavailable, headingInSchema]);

    if (!show || !editor || !editor.isEditable) {
      return null;
    }

    return (
      <Button
        type="button"
        className={className.trim()}
        disabled={isDisabled}
        data-style="ghost"
        data-active-state={isActive ? "on" : "off"}
        data-disabled={isDisabled}
        role="button"
        tabIndex={-1}
        aria-label={formattedName}
        aria-pressed={isActive}
        tooltip={formattedName}
        shortcutKeys={shortcutKey}
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        {children || (
          <>{text && <span className={`simple-tag ${colour}`}>tag</span>}</>
        )}
      </Button>
    );
  },
);

SimpleTagButton.displayName = "SimpleTagButton";

export default SimpleTagButton;
