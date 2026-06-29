import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
} from "react";
import {
  ChevronDownIcon,
  HeadingIcon,
  QuoteIcon,
  CodeBlockIcon,
} from "./icons";

interface BlockTypeDropdownProps {
  currentBlockType: string;
  onSelect: (blockType: string) => void;
}

const BLOCK_TYPES = [
  { value: "paragraph", label: "Paragraph", icon: null },
  { value: "h1", label: "Heading 1", icon: <HeadingIcon /> },
  { value: "h2", label: "Heading 2", icon: <HeadingIcon /> },
  { value: "h3", label: "Heading 3", icon: <HeadingIcon /> },
  { value: "h4", label: "Heading 4", icon: <HeadingIcon /> },
  { value: "h5", label: "Heading 5", icon: <HeadingIcon /> },
  { value: "h6", label: "Heading 6", icon: <HeadingIcon /> },
  { value: "quote", label: "Blockquote", icon: <QuoteIcon /> },
  { value: "code", label: "Code Block", icon: <CodeBlockIcon /> },
];

interface MenuPosition {
  top: number;
  left: number;
}

/**
 * Dropdown for selecting the block type (paragraph, headings, blockquote, code block).
 */
export function BlockTypeDropdown({
  currentBlockType,
  onSelect,
}: BlockTypeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({
    top: 0,
    left: 0,
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const currentLabel =
    BLOCK_TYPES.find((bt) => bt.value === currentBlockType)?.label ||
    "Paragraph";

  const updateMenuPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 4,
      left: rect.left,
    });
  }, []);

  const handleSelect = useCallback(
    (value: string) => {
      onSelect(value);
      setIsOpen(false);
    },
    [onSelect],
  );

  useLayoutEffect(() => {
    if (isOpen) {
      updateMenuPosition();
    }
  }, [isOpen, updateMenuPosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleResizeOrScroll = () => {
      updateMenuPosition();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResizeOrScroll);
    window.addEventListener("scroll", handleResizeOrScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResizeOrScroll);
      window.removeEventListener("scroll", handleResizeOrScroll, true);
    };
  }, [isOpen, updateMenuPosition]);

  return (
    <div className="trance-block-dropdown-wrapper" ref={dropdownRef}>
      <button
        ref={triggerRef}
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
        <div
          className="trance-block-dropdown-menu"
          role="listbox"
          style={{
            top: menuPosition.top,
            left: menuPosition.left,
          }}
        >
          {BLOCK_TYPES.map(({ value, label, icon }) => (
            <button
              key={value}
              type="button"
              role="option"
              className={`trance-block-dropdown-item${
                value === currentBlockType ? " active" : ""
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
