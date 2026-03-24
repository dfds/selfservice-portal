import { Node, mergeAttributes } from "@tiptap/core";

export interface TemplateVariableOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    templateVariable: {
      insertTemplateVariable: (variableName: string) => ReturnType;
    };
  }
}

export const TemplateVariableNode = Node.create<TemplateVariableOptions>({
  name: "templateVariable",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  marks: "_",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      variableName: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-variable-name"),
        renderHTML: (attributes) => ({
          "data-variable-name": attributes.variableName,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="template-variable"]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "template-variable",
        class: "template-variable-chip",
        contenteditable: "false",
      }),
      `{{${node.attrs.variableName}}}`,
    ];
  },

  addCommands() {
    return {
      insertTemplateVariable:
        (variableName: string) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { variableName },
          });
        },
    };
  },
});
