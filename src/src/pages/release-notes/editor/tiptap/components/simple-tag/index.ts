import { mergeAttributes, Mark } from "@tiptap/core";

export type SimpleTagOptions = {
  bgColour: string;
  HTMLAttributes: Record<string, any>;
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    color: {
      setSimpleTag: (color: string) => ReturnType;
      unsetSimpleTag: () => ReturnType;
      toggleSimpleTag: () => ReturnType;
    };
  }
}

export const SimpleTag = Mark.create<SimpleTagOptions>({
  name: "simpleTag",

  addOptions() {
    return {
      bgColour: "#ffffff",
      HTMLAttributes: {
        class: "simple-tag",
        "data-type": "simpleTag",
      },
    };
  },

  content: "text",
  marks: "",
  group: "block",
  code: false,
  defining: true,

  addAttributes() {
    return {
      bgColour: "#ffffff",
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="simple-tag"]',
        preserveWhitespace: "full",
      },
    ];
  },

  renderHTML({ mark, HTMLAttributes }) {
    console.log(HTMLAttributes);

    var mergedAttributes = mergeAttributes(
      this.options.HTMLAttributes,
      HTMLAttributes,
    );
    mergedAttributes.class = `${mergedAttributes.class} ${HTMLAttributes.bgColour}`;

    return ["span", mergedAttributes, 0];
  },

  addCommands() {
    return {
      setSimpleTag:
        (colour) =>
        ({ chain }) => {
          console.log("NANI");
          chain().setMark(this.name).run();

          return true;
        },
      toggleSimpleTag:
        () =>
        ({ commands }) => {
          return commands.toggleWrap(this.name);
        },
      unsetSimpleTag:
        () =>
        ({ commands }) => {
          return commands.lift(this.name);
        },
    };
  },
});
