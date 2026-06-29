import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

interface TableSizePickerProps {
  triggerRef: React.RefObject<HTMLElement | null>;
  onSelect: (rows: number, columns: number) => void;
  onCancel: () => void;
}

const MAX_ROWS = 10;
const MAX_COLS = 10;

/**
 * Grid-based table size selector.
 * Hover to preview dimensions, click to insert.
 */
export function TableSizePicker({
  triggerRef,
  onSelect,
  onCancel,
}: TableSizePickerProps) {
  const [hovered, setHovered] = useState({ rows: 1, cols: 1 });
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const triggerRect = triggerRef.current?.getBoundingClientRect();
    const pickerRect = wrapperRef.current?.getBoundingClientRect();

    if (triggerRect) {
      const pickerWidth = pickerRect?.width ?? 180;
      const left = Math.min(
        triggerRect.left,
        window.innerWidth - pickerWidth - 8,
      );
      setPosition({
        top: triggerRect.bottom + 4,
        left: Math.max(8, left),
      });
    }
  }, [triggerRef]);

  // Close on click outside or escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        onCancel();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel]);

  const handleCellHover = useCallback((row: number, col: number) => {
    setHovered({ rows: row + 1, cols: col + 1 });
  }, []);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      onSelect(row + 1, col + 1);
    },
    [onSelect],
  );

  return (
    <div
      ref={wrapperRef}
      className="trance-table-size-picker"
      role="dialog"
      aria-label="Select table size"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div className="trance-table-size-picker-label">
        {hovered.rows} × {hovered.cols} Table
      </div>
      <div className="trance-table-size-picker-grid">
        {Array.from({ length: MAX_ROWS }, (_, row) => (
          <div key={row} className="trance-table-size-picker-row">
            {Array.from({ length: MAX_COLS }, (_, col) => {
              const isActive = row < hovered.rows && col < hovered.cols;
              return (
                <button
                  key={`${row}-${col}`}
                  type="button"
                  className={
                    isActive
                      ? "trance-table-size-picker-cell active"
                      : "trance-table-size-picker-cell"
                  }
                  onMouseEnter={() => handleCellHover(row, col)}
                  onClick={() => handleCellClick(row, col)}
                  aria-label={`Insert ${row + 1} by ${col + 1} table`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
