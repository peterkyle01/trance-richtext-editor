import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TranceEditor } from '../editor/TranceEditor';

function getContent(container: HTMLElement): string {
  const ce = container.querySelector('[contenteditable]');
  return ce?.textContent ?? '';
}

describe('TranceEditor Controlled Mode', () => {
  it('renders the initial value', () => {
    const { container } = render(<TranceEditor value="<p>Controlled</p>" />);
    expect(getContent(container)).toContain('Controlled');
  });

  it('pushes external value changes into the editor', async () => {
    const { container, rerender } = render(
      <TranceEditor value="<p>One</p>" />,
    );
    expect(getContent(container)).toContain('One');

    rerender(<TranceEditor value="<p>Two</p>" />);
    await waitFor(() => {
      expect(getContent(container)).toContain('Two');
    });
    expect(getContent(container)).not.toContain('One');
  });

  it('does not reset content when the value echoes the editor emission', async () => {
    const onChange = vi.fn();
    const { container, rerender } = render(
      <TranceEditor
        value="<p>Stable content</p>"
        onChange={onChange}
        debounceMs={10}
      />,
    );

    // Wait for the first debounced emission
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
    const emitted = onChange.mock.calls[0][0].html as string;
    expect(emitted).toContain('Stable content');

    // Parent echoes the emission back as the controlled value
    const callsBefore = onChange.mock.calls.length;
    rerender(<TranceEditor value={emitted} onChange={onChange} debounceMs={10} />);

    // Give any (incorrect) re-push time to surface
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Content unchanged and no new onChange fires (no push → no loop)
    expect(getContent(container)).toContain('Stable content');
    expect(onChange.mock.calls.length).toBe(callsBefore);
  });

  it('renders defaultValue in uncontrolled mode', () => {
    const { container } = render(
      <TranceEditor defaultValue="<p>Default content</p>" />,
    );
    expect(getContent(container)).toContain('Default content');
  });

  it('value takes precedence over defaultValue', () => {
    const { container } = render(
      <TranceEditor
        value="<p>Controlled wins</p>"
        defaultValue="<p>Default loses</p>"
      />,
    );
    expect(getContent(container)).toContain('Controlled wins');
    expect(getContent(container)).not.toContain('Default loses');
  });

  it('pushes a real external change and emits onChange', async () => {
    const onChange = vi.fn();
    const { container, rerender } = render(
      <TranceEditor value="<p>Before</p>" onChange={onChange} debounceMs={10} />,
    );
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });

    const callsBefore = onChange.mock.calls.length;
    rerender(<TranceEditor value="<p>After</p>" onChange={onChange} debounceMs={10} />);

    await waitFor(() => {
      expect(getContent(container)).toContain('After');
    });
    await waitFor(() => {
      expect(onChange.mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });

  it('renders without a value prop in uncontrolled mode (backward compat)', () => {
    const { container } = render(
      <TranceEditor initialHtml="<p>Legacy init</p>" />,
    );
    expect(getContent(container)).toContain('Legacy init');
  });
});
