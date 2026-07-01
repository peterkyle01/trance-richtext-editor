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

  it('should default to light theme', () => {
    const html = '<p>Test</p>';
    const { container } = render(<TranceRenderer html={html} />);

    expect(container.firstChild).toHaveAttribute('data-trance-theme', 'light');
  });

  it('should support auto theme mode', () => {
    const html = '<p>Test</p>';
    const { container } = render(<TranceRenderer html={html} theme="auto" />);

    expect(container.firstChild).toHaveAttribute('data-trance-theme', 'auto');
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

  it('should render empty string gracefully', () => {
    const { container } = render(<TranceRenderer html="" />);

    const contentDiv = container.querySelector('.trance-renderer-content');
    expect(contentDiv).toBeInTheDocument();
    expect(contentDiv?.innerHTML).toBe('');
  });

  it('should render plain text wrapped in paragraph tags', () => {
    const html = '<p>Simple paragraph</p>';
    render(<TranceRenderer html={html} />);

    expect(screen.getByText('Simple paragraph')).toBeInTheDocument();
  });

  it('should render blockquote elements', () => {
    const html = '<blockquote>A notable quote</blockquote>';
    render(<TranceRenderer html={html} />);

    expect(screen.getByText('A notable quote')).toBeInTheDocument();
  });

  it('should preserve allowed attributes like target and rel on links', () => {
    const html = '<a href="https://example.com" target="_blank" rel="noopener">Example</a>';
    const { container } = render(<TranceRenderer html={html} />);

    const link = container.querySelector('a');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toBe('noopener');
  });

  it('should strip disallowed attributes like onclick', () => {
    const html = '<p onclick="alert(1)">Click me</p>';
    const { container } = render(<TranceRenderer html={html} />);

    const p = container.querySelector('p');
    expect(p?.getAttribute('onclick')).toBeNull();
  });
});
