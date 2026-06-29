import React, { type ReactNode, type MouseEventHandler } from 'react';

interface ToolbarButtonProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
  shortcut?: string;
}

/**
 * A single toolbar button with icon, tooltip, and active/disabled states.
 */
export function ToolbarButton({
  icon,
  label,
  active = false,
  disabled = false,
  onClick,
  shortcut,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className={`trance-toolbar-btn${active ? ' active' : ''}`}
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      title={shortcut ? `${label} (${shortcut})` : label}
    >
      {icon}
      <span className="trance-tooltip">
        {label}
        {shortcut && <span style={{ opacity: 0.7, marginLeft: 4 }}>{shortcut}</span>}
      </span>
    </button>
  );
}

/**
 * A visual separator between toolbar button groups.
 */
export function ToolbarSeparator() {
  return <div className="trance-toolbar-separator" aria-hidden="true" />;
}
