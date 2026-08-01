import { describe, it } from 'vitest';
import { createEditor } from 'lexical';
import { TRANCE_NODES } from '../editor/nodes';
import { tranceLexicalTheme } from '../styles/lexical-theme';
import { deserializeFromHtml, serializeToJson } from '../serialization';

describe('DEBUG checklist', () => {
  it('shows what happens', () => {
    const editor = createEditor({
      namespace: 'DebugEditor',
      nodes: TRANCE_NODES,
      theme: tranceLexicalTheme,
    });

    try {
      editor.update(
        () => {
          deserializeFromHtml(
            editor,
            '<ul type="check"><li aria-checked="true">Done</li><li aria-checked="false">Todo</li></ul>',
          );
        },
        { discrete: true },
      );
      const json = serializeToJson(editor);
      console.log('DEBUG JSON:', JSON.stringify(json.root.children));
    } catch (err) {
      console.log('DEBUG ERROR:', (err as Error).message);
    }
  });
});
