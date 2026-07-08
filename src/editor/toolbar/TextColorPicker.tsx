import React, { useCallback, useRef, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { $patchStyleText } from "@lexical/selection";

const TEXT_COLORS = [
  "#000000", "#434343", "#666666", "#999999", "#b7b7b7", "#cccccc",
  "#d9161c", "#e8433e", "#f3693b", "#ff9933", "#f4c341", "#ffd966",
  "#5fb236", "#6aa84f", "#57bb8a", "#2b6a99", "#3c78d8", "#7b68ee",
  "#a64d79", "#c90076", "#e06b8b", "#e6918e",
];

export interface TextColorPickerProps {
  currentColor: string | undefined;
  onColorChange: (color: string) => void;
}

export function TextColorPicker({ currentColor, onColorChange }: TextColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const toggle = useCallback(() => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 4, left: rect.left });
    }
    setIsOpen(!isOpen);
  }, [isOpen]);

  const handleSelect = useCallback((color: string) => {
    // Restore editor focus before applying color to ensure selection is valid
    const wrapper = wrapperRef.current?.closest?.(".trance-editor-wrapper");
    const editorEl = wrapper?.querySelector?.("[contenteditable]");
    if (editorEl instanceof HTMLElement) editorEl.focus();
    onColorChange(color);
    setIsOpen(false);
  }, [onColorChange]);

  const handleReset = useCallback(() => {
    const wrapper = wrapperRef.current?.closest?.(".trance-editor-wrapper");
    const editorEl = wrapper?.querySelector?.("[contenteditable]");
    if (editorEl instanceof HTMLElement) editorEl.focus();
    onColorChange("");
    setIsOpen(false);
  }, [onColorChange]);

  // Close on click outside
  React.useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen]);

  return (
    <div className="trance-color-picker-wrapper" ref={wrapperRef}>
      <button
        ref={buttonRef}
        type="button"
        className={`trance-toolbar-btn${currentColor ? " active" : ""}`}
        onClick={toggle}
        aria-label="Text Color"
        title="Text Color"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4L4 20h3l1.5-4h7L17 20h3L13 4h-2z" />
          <line x1="7.5" y1="13" x2="16.5" y2="13" />
        </svg>
        <span
          style={{
            position: "absolute",
            bottom: 3,
            left: "50%",
            transform: "translateX(-50%)",
            width: 12,
            height: 2,
            borderRadius: 1,
            background: currentColor || "var(--trance-text-secondary)",
          }}
        />
      </button>
      {isOpen && (
        <div
          className="trance-color-picker-dropdown"
          role="dialog"
          aria-label="Select text color"
          style={{ top: position.top, left: position.left }}
        >
          <div className="trance-color-picker-label">Text Color</div>
          <div className="trance-color-picker-grid">
            {TEXT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`trance-color-swatch${currentColor === color ? " active" : ""}`}
                style={{ background: color }}
                onClick={() => handleSelect(color)}
                aria-label={color}
                title={color}
              />
            ))}
          </div>
          <button
            type="button"
            className="trance-color-reset"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
