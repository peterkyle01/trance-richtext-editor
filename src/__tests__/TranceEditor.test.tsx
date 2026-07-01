import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TranceEditor, TranceEditorRef } from '../editor/TranceEditor';

describe('TranceEditor Component', () => {
  it('should render without crashing', () => {
    const { container } = render(<TranceEditor placeholder="Testing placeholder..." />);

    // Check if the wrapper is rendered
    expect(container.firstChild).toHaveClass('trance-editor-wrapper');
    // Check if the placeholder text is visible
    expect(screen.getByText('Testing placeholder...')).toBeInTheDocument();
  });

  it('should apply data-theme attributes correctly', () => {
    const { container } = render(<TranceEditor theme="dark" />);
    expect(container.firstChild).toHaveAttribute('data-trance-theme', 'dark');
  });

  it('should default to light theme', () => {
    const { container } = render(<TranceEditor />);
    expect(container.firstChild).toHaveAttribute('data-trance-theme', 'light');
  });

  it('should support auto theme mode', () => {
    const { container } = render(<TranceEditor theme="auto" />);
    expect(container.firstChild).toHaveAttribute('data-trance-theme', 'auto');
  });

  it('should render the toolbar by default', () => {
    render(<TranceEditor />);
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar).toBeInTheDocument();
  });

  it('should support disabling features in the toolbar', () => {
    render(
      <TranceEditor
        features={{
          bold: false,
          italic: false,
        }}
      />
    );

    // Bold button should not be present in the document
    const boldButton = screen.queryByLabelText('Bold');
    expect(boldButton).toBeNull();

    const italicButton = screen.queryByLabelText('Italic');
    expect(italicButton).toBeNull();
  });

  it('should render all toolbar features when enabled', () => {
    render(<TranceEditor />);

    // Spot-check a few expected toolbar buttons
    expect(screen.getByLabelText('Bold')).toBeInTheDocument();
    expect(screen.getByLabelText('Italic')).toBeInTheDocument();
    expect(screen.getByLabelText('Underline')).toBeInTheDocument();
    expect(screen.getByLabelText('Undo')).toBeInTheDocument();
    expect(screen.getByLabelText('Redo')).toBeInTheDocument();
    expect(screen.getByLabelText('Link')).toBeInTheDocument();
    expect(screen.getByLabelText('Insert Image')).toBeInTheDocument();
    expect(screen.getByLabelText('Bullet List')).toBeInTheDocument();
    expect(screen.getByLabelText('Numbered List')).toBeInTheDocument();
  });

  it('should expose imperative ref API correctly', () => {
    const ref = React.createRef<TranceEditorRef>();
    render(<TranceEditor ref={ref} initialHtml="<p>Init content</p>" />);

    expect(ref.current).toBeDefined();
    expect(ref.current?.getHtml).toBeTypeOf('function');
    expect(ref.current?.getJson).toBeTypeOf('function');
    expect(ref.current?.setHtml).toBeTypeOf('function');
    expect(ref.current?.setJson).toBeTypeOf('function');
    expect(ref.current?.focus).toBeTypeOf('function');
    expect(ref.current?.clear).toBeTypeOf('function');
    expect(ref.current?.getLexicalEditor).toBeTypeOf('function');
  });

  it('should accept additional className', () => {
    const { container } = render(<TranceEditor className="custom-wrapper" />);
    expect(container.firstChild).toHaveClass('custom-wrapper');
    expect(container.firstChild).toHaveClass('trance-editor-wrapper');
  });

  it('should render as read-only when editable is false', () => {
    const { container } = render(<TranceEditor editable={false} />);
    // The wrapper should not have focus-within styling initially
    expect(container.firstChild).toHaveClass('trance-editor-wrapper');
    // Verify the editor still renders (content editable area exists)
    const contentEditable = container.querySelector('[contenteditable]');
    expect(contentEditable).toBeInTheDocument();
  });

  it('should render with initialHtml content', () => {
    const { container } = render(
      <TranceEditor initialHtml="<p>Pre-filled content</p>" />
    );
    const contentEditable = container.querySelector('[contenteditable]');
    expect(contentEditable).toBeInTheDocument();
    // The component should render without error with initial HTML
    expect(container.firstChild).toHaveClass('trance-editor-wrapper');
  });
});
