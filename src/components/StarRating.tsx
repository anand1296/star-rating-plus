// src/components/StarRating.tsx
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
  /**
   * Per-index colors.
   * Provide an array whose length is equal to `total`. If shorter, last color repeats.
   */
  colors?: string[];
  /** If true disables interaction */
  readOnly?: boolean;
  /** Optional wrapper classes (Tailwind-friendly) */
  className?: string;
  /** onChange callback (value: number) */
  onChange?: (value: number) => void;
  /**
   * Explicit gap between stars.
   * Accepts CSS length (e.g. '1rem', '8px') or a number (interpreted as px).
   * If provided, this takes precedence over host CSS classes.
   */
  gap?: string | number;
}

/** Normalize gap value to CSS length string */
const normalizeGap = (gap?: string | number | null): string | undefined => {
  if (gap === undefined || gap === null) return undefined;
  if (typeof gap === 'number') return `${gap}px`;
  const s = String(gap).trim();
  if (/^\d+$/.test(s)) return `${s}px`;
  // allow '1rem', '8px', '0.5em', '%'
  return s;
};

/** Ensure colors array length equals total (repeat last color if needed) */
const normalizeColors = (maybeColors: string[] | undefined, total: number, defaultColor = '#ffd055') => {
  if (!maybeColors || maybeColors.length === 0) return Array(total).fill(defaultColor);
  const out = [...maybeColors];
  while (out.length < total) out.push(out[out.length - 1] ?? defaultColor);
  return out.slice(0, total);
};

export const StarRating: React.FC<StarRatingProps> = (props) => {
  const {
    total,
    value,
    defaultValue = 0,
    size = 28,
    colors,
    readOnly = false,
    className,
    onChange,
    gap,
  } = props;

  if (!Number.isFinite(total) || total <= 0) {
    throw new Error('StarRating: `total` prop is required and must be a positive number.');
  }

  const effectiveColors = useMemo(() => normalizeColors(colors, total), [colors, total]);

  const isControlled = typeof value === 'number';
  const [internalValue, setInternalValue] = useState<number>(defaultValue ?? 0);
  const selected = isControlled ? (value ?? 0) : internalValue;

  const [hoverIndex, setHoverIndex] = useState<number>(0);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Gap precedence:
  // 1) explicit gap prop (if provided)
  // 2) CSS var --sr-gap on host (e.g. className="[--sr-gap:2rem]")
  // 3) host computed style gap (Tailwind or other CSS)
  // 4) fallback default '0.5rem'
  const cssGapFromProp = normalizeGap(gap);
  const cssVarName = '--sr-gap';
  const fallbackGap = '0.5rem';

  const applyGapLogic = () => {
    const el = rootRef.current;
    if (!el) return;

    // 1) explicit prop
    if (cssGapFromProp != null) {
      el.style.gap = cssGapFromProp;
      return;
    }

    // 2) CSS variable on host
    const varVal = getComputedStyle(el).getPropertyValue(cssVarName)?.trim();
    if (varVal) {
      el.style.gap = varVal;
      return;
    }

    // 3) host computed gap (Tailwind)
    const computedGap = getComputedStyle(el).getPropertyValue('gap') || '';
    if (computedGap && computedGap !== '0px' && computedGap !== 'normal') {
      // Let host CSS control it: remove inline override (important so tailwind classes win)
      el.style.removeProperty('gap');
      return;
    }

    // 4) fallback
    el.style.gap = fallbackGap;
  };

  // Run gap logic on mount and when className/gap change
  useEffect(() => {
    applyGapLogic();
    // Re-evaluate after a short tick — some frameworks apply classes after mount
    const t = setTimeout(() => applyGapLogic(), 50);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [className, gap, cssGapFromProp]); // intentionally not depending on computed style

  // Re-evaluate on window resize (responsive tailwind classes)
  useEffect(() => {
    const onResize = () => applyGapLogic();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (isControlled && typeof value === 'number') {
      if (value < 0 || value > total) {
        console.warn('StarRating: controlled `value` out of range; expected 0..total');
      }
    }
  }, [isControlled, value, total]);

  const commitValue = (v: number) => {
    if (readOnly) return;
    if (!isControlled) setInternalValue(v);
    onChange?.(v);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (readOnly) return;
    const key = e.key;
    if (key === 'ArrowRight' || key === 'ArrowUp') {
      e.preventDefault();
      commitValue(Math.min(total, (selected ?? 0) + 1 || 1));
    } else if (key === 'ArrowLeft' || key === 'ArrowDown') {
      e.preventDefault();
      commitValue(Math.max(0, (selected ?? 0) - 1));
    } else if (key === 'Home') {
      e.preventDefault();
      commitValue(0);
    } else if (key === 'End') {
      e.preventDefault();
      commitValue(total);
    } else if (key === 'Enter' || key === ' ') {
      e.preventDefault();
    }
  };

  const starColorForIndex = (i: number) => {
    if (hoverIndex > 0) {
      return i <= hoverIndex ? effectiveColors[hoverIndex - 1] : 'transparent';
    }
    if (selected > 0) {
      return i <= selected ? effectiveColors[selected - 1] : 'transparent';
    }
    return 'transparent';
  };

  return (
    <div
      role="radiogroup"
      aria-label="Star rating"
      tabIndex={0}
      ref={rootRef}
      onKeyDown={handleKeyDown}
      className={`star-rating-root inline-flex items-center ${className ?? ''}`}
      // Do NOT set gap inline here; gap is managed in applyGapLogic to allow Tailwind to win.
      style={{ 
        display: 'inline-flex',
        alignItems: 'center',
       }}
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
            aria-label={`${i} star`}
            title={`${i} star`}
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
            <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={{ display: 'block' }}>
              <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.401 8.168L12 18.896l-7.335 3.869 1.401-8.168L.132 9.21l8.2-1.192z" fill={color} stroke="#d9d9d9" strokeWidth="0.5" />
            </svg>
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
