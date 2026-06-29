import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

// Handlebars-style block helpers ({{#each User.Capabilities}} … {{/each}}) are
// rendered server-side, so they live in the document as plain text. Without a
// visual cue they read as ordinary body copy. This plugin scans text nodes and
// decorates the opening/closing markers so authors can see the loop structure.
const BLOCK_MARKER_RE = /\{\{\s*(#each\s+[\w.]+|\/each)\s*\}\}/g;

const blockHelperHighlightKey = new PluginKey("blockHelperHighlight");

function buildDecorations(doc: any): DecorationSet {
  const decorations: Decoration[] = [];

  doc.descendants((node: any, pos: number) => {
    if (!node.isText || !node.text) return;
    const text: string = node.text;
    BLOCK_MARKER_RE.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = BLOCK_MARKER_RE.exec(text)) !== null) {
      const from = pos + match.index;
      const to = from + match[0].length;
      decorations.push(
        Decoration.inline(from, to, { class: "template-block-marker" }),
      );
    }
  });

  return DecorationSet.create(doc, decorations);
}

export const BlockHelperHighlight = Extension.create({
  name: "blockHelperHighlight",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: blockHelperHighlightKey,
        state: {
          init(_, { doc }) {
            return buildDecorations(doc);
          },
          apply(tr, old) {
            return tr.docChanged ? buildDecorations(tr.doc) : old;
          },
        },
        props: {
          decorations(state) {
            return blockHelperHighlightKey.getState(state);
          },
        },
      }),
    ];
  },
});
