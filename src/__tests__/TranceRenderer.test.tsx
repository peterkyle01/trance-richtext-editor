import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TranceRenderer } from '../renderer/TranceRenderer';

describe('TranceRenderer Component', () => {
  it('should render HTML content correctly', () => {
    const html = '<p>Hello <strong>world</strong></p>';
    render(<TranceRenderer html={html} />);
    
    const boldElement = screen.getByText('world');
    expect(boldElement.tagName).toBe('STRONG');
    expect(boldElement.parentElement?.tagName).toBe('P');
  });

  it('should apply custom className', () => {
    const html = '<p>Test</p>';
    const { container } = render(<TranceRenderer html={html} className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
    expect(container.firstChild).toHaveClass('trance-renderer');
  });

  it('should set theme attribute correctly', () => {
    const html = '<p>Test</p>';
    const { container } = render(<TranceRenderer html={html} theme="dark" />);
    
    expect(container.firstChild).toHaveAttribute('data-trance-theme', 'dark');
  });

  it('should sanitize dangerous HTML using DOMPurify', () => {
    const dangerousHtml = '<p>Hello <script>alert("hack")</script>world <img src="x" onerror="alert(1)"></p>';
    const { container } = render(<TranceRenderer html={dangerousHtml} />);
    
    // Script tag should be stripped
    expect(container.querySelector('script')).toBeNull();
    // Image element is allowed but onerror handler must be stripped
    const imgElement = container.querySelector('img');
    expect(imgElement).not.toBeNull();
    expect(imgElement?.getAttribute('onerror')).toBeNull();
    expect(imgElement?.getAttribute('src')).toBe('x');
  });
});
