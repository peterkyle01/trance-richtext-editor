import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import {
  $createRangeSelection,
  $getRoot,
  $isTextNode,
  $setSelection,
} from 'lexical';
import { TranceEditor, TranceEditorRef } from '../editor/TranceEditor';

/**
 * jsdom has no layout and does not implement Range.getClientRects, so Lexical
 * would compute no selection rect. Define it to simulate a real selection box.
 */
function mockSelectionRect(
  rect: Partial<DOMRect> = { left: 100, top: 80, width: 200, height: 20 },
) {
  Object.defineProperty(Range.prototype, 'getClientRects', {
    configurable: true,
    writable: true,
    value: () => [rect as DOMRect],
  });
}

/** Select all editor content via Lexical's own selection API. */
function selectAll(ref: React.RefObject<TranceEditorRef | null>) {
  const editor = ref.current!.getLexicalEditor();
  editor.update(
    () => {
      const root = $getRoot();
      const first = root.getFirstDescendant();
      const last = root.getLastDescendant();
      if (!$isTextNode(first) || !$isTextNode(last)) return;
      const selection = $createRangeSelection();
      selection.anchor.set(first.getKey(), 0, 'text');
      selection.focus.set(
        last.getKey(),
        last.getTextContentSize(),
        'text',
      );
      $setSelection(selection);
    },
    { discrete: true },
  );
}

/** Collapse the editor selection to the start of the content. */
function collapseSelection(ref: React.RefObject<TranceEditorRef | null>) {
  const editor = ref.current!.getLexicalEditor();
  editor.update(
    () => {
      const root = $getRoot();
      const first = root.getFirstDescendant();
      if (!$isTextNode(first)) return;
      const selection = $createRangeSelection();
      selection.anchor.set(first.getKey(), 0, 'text');
      selection.focus.set(first.getKey(), 0, 'text');
      $setSelection(selection);
    },
    { discrete: true },
  );
}

function getBar(container: HTMLElement): HTMLElement | null {
  return container.querySelector(
    '[role="toolbar"][aria-label="Formatting"]',
  );
}

afterEach(() => {
  delete (Range.prototype as unknown as Record<string, unknown>)
    .getClientRects;
});

describe('Floating formatting bar', () => {
  it('is hidden when there is no text selection', () => {
    const { container } = render(
      <TranceEditor initialHtml="<p>Some content</p>" />,
    );
    expect(getBar(container)).toBeNull();
  });

  it('appears when text is selected', async () => {
    const ref = React.createRef<TranceEditorRef>();
    const { container } = render(
      <TranceEditor ref={ref} initialHtml="<p>Selectable content</p>" />,
    );
    mockSelectionRect();
    selectAll(ref);

    await waitFor(() => {
      expect(getBar(container)).not.toBeNull();
    });

    const bar = getBar(container) as HTMLElement;
    expect(bar.querySelector('[aria-label="Bold"]')).not.toBeNull();
    expect(bar.querySelector('[aria-label="Italic"]')).not.toBeNull();
    expect(bar.querySelector('[aria-label="Link"]')).not.toBeNull();
  });

  it('is hidden when the selection collapses', async () => {
    const ref = React.createRef<TranceEditorRef>();
    const { container } = render(
      <TranceEditor ref={ref} initialHtml="<p>Selectable content</p>" />,
    );
    mockSelectionRect();
    selectAll(ref);

    await waitFor(() => {
      expect(getBar(container)).not.toBeNull();
    });

    collapseSelection(ref);

    await waitFor(() => {
      expect(getBar(container)).toBeNull();
    });
  });

  it('hides on Escape', async () => {
    const ref = React.createRef<TranceEditorRef>();
    const { container } = render(
      <TranceEditor ref={ref} initialHtml="<p>Selectable content</p>" />,
    );
    mockSelectionRect();
    selectAll(ref);

    await waitFor(() => {
      expect(getBar(container)).not.toBeNull();
    });

    const ce = container.querySelector('[contenteditable]') as HTMLElement;
    ce.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );

    await waitFor(() => {
      expect(getBar(container)).toBeNull();
    });
  });

  it('is disabled via features.floatingBar', async () => {
    const ref = React.createRef<TranceEditorRef>();
    const { container } = render(
      <TranceEditor
        ref={ref}
        initialHtml="<p>Selectable content</p>"
        features={{ floatingBar: false }}
      />,
    );
    mockSelectionRect();
    selectAll(ref);

    // Give a would-be appearance a moment to surface
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(getBar(container)).toBeNull();
  });

  it('respects individual feature flags', async () => {
    const ref = React.createRef<TranceEditorRef>();
    const { container } = render(
      <TranceEditor
        ref={ref}
        initialHtml="<p>Selectable content</p>"
        features={{ bold: false, link: false }}
      />,
    );
    mockSelectionRect();
    selectAll(ref);

    await waitFor(() => {
      expect(getBar(container)).not.toBeNull();
    });

    const bar = getBar(container) as HTMLElement;
    expect(bar.querySelector('[aria-label="Bold"]')).toBeNull();
    expect(bar.querySelector('[aria-label="Link"]')).toBeNull();
    expect(bar.querySelector('[aria-label="Italic"]')).not.toBeNull();
  });
});
