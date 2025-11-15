import React, { useEffect, useMemo, useRef, useState } from 'react';

export interface StarRatingProps {
  /** REQUIRED: number of stars to render */
  total: number;
  /** Controlled value (selected stars count) */
  value?: number;
  /** Uncontrolled initial value */
  defaultValue?: number;
  /** Pixel size of each star (width & height) */
  size?: number;
  /** Per-index hover colors e.g. ['#8B0000', '#ff6b6b', ...]. If shorter than total the last color repeats. */
  hoverColors?: string[];
  /** If true disables interaction */
  readOnly?: boolean;
  /** Optional wrapper classes (Tailwind-friendly) */
  className?: string;
  /** onChange callback (value: number) */
  onChange?: (value: number) => void;
}

/**
 * StarRating component
 *
 * - total is required (TS enforces it). At runtime we validate and throw if invalid.
 * - Default hover/selection color is yellow (#ffd055).
 * - If only <StarRating total={3} /> is used it renders 3 empty stars.
 */
export const StarRating: React.FC<StarRatingProps> = (props) => {
  const {
    total,
    value,
    defaultValue = 0,
    size = 28,
    hoverColors,
    readOnly = false,
    className,
    onChange,
  } = props;

  // Runtime validation: total is required and must be >= 1
  if (!Number.isFinite(total) || total <= 0) {
    throw new Error('StarRating: `total` prop is required and must be a positive number.');
  }

  // Default color (yellow) if hoverColors not provided
  const defaultColor = '#ffd055';

  // Build a hoverColors array of length `total` using provided colors or default
  const normalizedHoverColors = useMemo(() => {
    if (!hoverColors || !hoverColors.length) {
      return Array(total).fill(defaultColor);
    }
    // If provided shorter array, repeat last color for remaining slots
    const out = [...hoverColors];
    while (out.length < total) {
      out.push(out[out.length - 1] ?? defaultColor);
    }
    return out.slice(0, total);
  }, [hoverColors, total]);

  // Controlled vs uncontrolled state
  const isControlled = typeof value === 'number';
  const [internalValue, setInternalValue] = useState<number>(defaultValue ?? 0);
  const selected = isControlled ? (value ?? 0) : internalValue;

  // Hover index: 0 = none, 1..total are hovered star counts
  const [hoverIndex, setHoverIndex] = useState<number>(0);

  // Keep a ref to the radiogroup for keyboard handling
  const groupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // If controlled and value is out of range, clamp
    if (isControlled && typeof value === 'number') {
      if (value < 0 || value > total) {
        console.warn('StarRating: controlled `value` out of range; expected 0..total');
      }
    }
  }, [isControlled, value, total]);

  const commitValue = (v: number) => {
    if (readOnly) return;
    if (!isControlled) setInternalValue(v);
    if (onChange) onChange(v);
  };

  // Keyboard support: ArrowLeft / ArrowRight / Home / End / Enter / Space
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (readOnly) return;
    const key = e.key;
    if (key === 'ArrowRight' || key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(total, (selected ?? 0) + 1 || 1);
      commitValue(next);
    } else if (key === 'ArrowLeft' || key === 'ArrowDown') {
      e.preventDefault();
      const prev = Math.max(0, (selected ?? 0) - 1);
      commitValue(prev);
    } else if (key === 'Home') {
      e.preventDefault();
      commitValue(0);
    } else if (key === 'End') {
      e.preventDefault();
      commitValue(total);
    } else if (key === 'Enter' || key === ' ') {
      // Enter/Space do nothing special here because clicks handle selection,
      // but we prevent page scroll on space.
      e.preventDefault();
    }
  };

  // Determine color for a star at index i (1-based)
  const starColorForIndex = (i: number) => {
    // Hover takes precedence while hovering
    if (hoverIndex > 0) {
      return i <= hoverIndex ? normalizedHoverColors[hoverIndex - 1] : 'transparent';
    }
    // Otherwise show selected color for selected stars
    if (selected > 0) {
      return i <= selected ? normalizedHoverColors[selected - 1] : 'transparent';
    }
    // default empty star
    return 'transparent';
  };

  // Accessibility: aria-label for each star e.g. "3 star"
  const starLabel = (i: number) => `${i} star`;

  return (
    <div
      role="radiogroup"
      aria-label="Star rating"
      tabIndex={0}
      ref={groupRef}
      onKeyDown={handleKeyDown}
      className={`star-rating-root inline-flex items-center ${className ?? ''}`}
      style={{ gap: '0.5rem' /* default gap; consumers can override with className */ }}
    >
      {Array.from({ length: total }, (_, idx) => {
        const i = idx + 1;
        const color = starColorForIndex(i);
        const isChecked = selected === i;
        return (
          <button
            key={i}
            role="radio"
            aria-checked={isChecked}
            aria-label={starLabel(i)}
            title={starLabel(i)}
            tabIndex={-1}
            onMouseEnter={() => setHoverIndex(i)}
            onMouseMove={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(0)}
            onFocus={() => setHoverIndex(i)}
            onBlur={() => setHoverIndex(0)}
            onClick={() => commitValue(i)}
            disabled={readOnly}
            style={{
              width: size,
              height: size,
              background: 'transparent',
              border: 'none',
              padding: 0,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: readOnly ? 'default' : 'pointer',
            }}
          >
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
              style={{ display: 'block' }}
            >
              <path
                d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.401 8.168L12 18.896l-7.335 3.869 1.401-8.168L.132 9.21l8.2-1.192z"
                fill={color}
                stroke="#d9d9d9"
                strokeWidth="0.5"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
