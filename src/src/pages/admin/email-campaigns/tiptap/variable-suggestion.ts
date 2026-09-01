import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { DecorationSet } from "@tiptap/pm/view";

export interface VariableSuggestionOptions {
  onOpen: (query: string, from: number, to: number) => void;
  onClose: () => void;
  onUpdate: (query: string, from: number, to: number) => void;
}

const variableSuggestionKey = new PluginKey("variableSuggestion");

export const VariableSuggestion = Extension.create<VariableSuggestionOptions>({
  name: "variableSuggestion",

  addOptions() {
    return {
      onOpen: () => {},
      onClose: () => {},
      onUpdate: () => {},
    };
  },

  addProseMirrorPlugins() {
    const options = this.options;

    return [
      new Plugin({
        key: variableSuggestionKey,
        state: {
          init() {
            return { active: false, query: "", from: 0, to: 0 };
          },
          apply(tr, prev) {
            const { selection } = tr;
            if (!selection.empty) {
              if (prev.active) options.onClose();
              return { active: false, query: "", from: 0, to: 0 };
            }

            const pos = selection.$from;
            const textBefore = pos.parent.textBetween(
              Math.max(0, pos.parentOffset - 50),
              pos.parentOffset,
              undefined,
              "\ufffc",
            );

            const match = textBefore.match(/\{\{([A-Za-z.]*)$/);

            if (match) {
              const query = match[1];
              const from = pos.pos - query.length - 2; // position of first {
              const to = pos.pos;

              if (!prev.active) {
                options.onOpen(query, from, to);
              } else {
                options.onUpdate(query, from, to);
              }

              return { active: true, query, from, to };
            }

            if (prev.active) {
              options.onClose();
            }
            return { active: false, query: "", from: 0, to: 0 };
          },
        },
        props: {
          decorations(state) {
            const pluginState = variableSuggestionKey.getState(state);
            if (!pluginState?.active) return DecorationSet.empty;
            return DecorationSet.empty;
          },
        },
      }),
    ];
  },
});
