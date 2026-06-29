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
  });
});
