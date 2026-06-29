import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDownIcon, HeadingIcon, QuoteIcon, CodeBlockIcon } from './icons';

interface BlockTypeDropdownProps {
  currentBlockType: string;
  onSelect: (blockType: string) => void;
}

const BLOCK_TYPES = [
  { value: 'paragraph', label: 'Paragraph', icon: null },
  { value: 'h1', label: 'Heading 1', icon: <HeadingIcon /> },
  { value: 'h2', label: 'Heading 2', icon: <HeadingIcon /> },
  { value: 'h3', label: 'Heading 3', icon: <HeadingIcon /> },
  { value: 'h4', label: 'Heading 4', icon: <HeadingIcon /> },
  { value: 'h5', label: 'Heading 5', icon: <HeadingIcon /> },
  { value: 'h6', label: 'Heading 6', icon: <HeadingIcon /> },
  { value: 'quote', label: 'Blockquote', icon: <QuoteIcon /> },
  { value: 'code', label: 'Code Block', icon: <CodeBlockIcon /> },
];

/**
 * Dropdown for selecting the block type (paragraph, headings, blockquote, code block).
 */
export function BlockTypeDropdown({
  currentBlockType,
  onSelect,
}: BlockTypeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLabel =
    BLOCK_TYPES.find((bt) => bt.value === currentBlockType)?.label || 'Paragraph';

  const handleSelect = useCallback(
    (value: string) => {
      onSelect(value);
      setIsOpen(false);
    },
    [onSelect]
  );

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  return (
    <div className="trance-block-dropdown-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className="trance-block-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select block type"
      >
        {currentLabel}
        <ChevronDownIcon />
      </button>

      {isOpen && (
        <div className="trance-block-dropdown-menu" role="listbox">
          {BLOCK_TYPES.map(({ value, label, icon }) => (
            <button
              key={value}
              type="button"
              role="option"
              className={`trance-block-dropdown-item${
                value === currentBlockType ? ' active' : ''
              }`}
              aria-selected={value === currentBlockType}
              onClick={() => handleSelect(value)}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
