// src/components/StarRating.tsx
import React, { useState, useCallback, useMemo } from "react";

// add to the props type
export type StarRatingProps = {
  total?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (v: number) => void;
  size?: number;
  readOnly?: boolean;
  hoverColors?: string[];
  gap?: number | string;
  className?: string;
  style?: React.CSSProperties;
};

const TRANSPARENT = "transparent";
const DEFAULT_COLORS = ["#8B0000", "#ff6b6b", "#ffd055", "#b7eb8f", "#237804"];

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

const StarSVG: React.FC<{ size: number; fill: string }> = ({ size, fill }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.401 8.168L12 18.896l-7.335 3.869 1.401-8.168L.132 9.21l8.2-1.192z"
      fill={fill}
      stroke={fill === TRANSPARENT ? "#d9d9d9" : "none"}
      strokeWidth={0.5}
    />
  </svg>
);

export const StarRating: React.FC<StarRatingProps> = ({
  total = 5,
  value,
  defaultValue = 0,
  onChange,
  size = 28,
  readOnly = false,
  hoverColors,
  className,
  gap,
  style,
}) => {
  const [uncontrolled, setUncontrolled] = useState(
    Math.max(0, Math.min(total, defaultValue))
  );
  const [hoverIndex, setHoverIndex] = useState(0);
  const isControlled = value !== undefined;
  const selected = clamp(
    isControlled ? (value as number) : uncontrolled,
    0,
    total
  );

  const resolvedHoverColors = useMemo(() => {
    if (hoverColors && hoverColors.length >= total)
      return hoverColors.slice(0, total);
    return Array.from(
      { length: total },
      (_, i) =>
        DEFAULT_COLORS[
          Math.floor((i / Math.max(1, total - 1)) * (DEFAULT_COLORS.length - 1))
        ] || DEFAULT_COLORS[DEFAULT_COLORS.length - 1]
    );
  }, [hoverColors, total]);

  const colorForSelected = useCallback(
    (n: number) => {
      if (n <= 0) return TRANSPARENT;
      const idx = clamp(n, 1, resolvedHoverColors.length) - 1;
      return resolvedHoverColors[idx] ?? DEFAULT_COLORS[2];
    },
    [resolvedHoverColors]
  );

  const fillFor = useCallback(
    (i: number) => {
      if (hoverIndex > 0)
        return i <= hoverIndex
          ? resolvedHoverColors[hoverIndex - 1]
          : TRANSPARENT;
      return i <= selected ? colorForSelected(selected) : TRANSPARENT;
    },
    [hoverIndex, resolvedHoverColors, selected, colorForSelected]
  );

  const handleSelect = useCallback(
    (n: number) => {
      if (readOnly) return;
      if (!isControlled) setUncontrolled(n);
      onChange?.(n);
    },
    [isControlled, onChange, readOnly]
  );

  // compute resolvedGap for the root
  const resolvedGap =
    gap !== undefined
      ? typeof gap === "number"
        ? `${gap}px`
        : gap
      : undefined;

  return (
    <div
      className={`star-rating-root flex gap-2 items-center ${
        className ?? ""
      }`}
      style={{
        display: "flex",
        gap: resolvedGap ?? undefined, // inline gap takes precedence over classes
        ...style,
      }}
      onMouseLeave={() => setHoverIndex(0)}
      role="radiogroup"
      tabIndex={readOnly ? -1 : 0}
    >
      {Array.from({ length: total }, (_, idx) => {
        const i = idx + 1;
        const fill = fillFor(i);
        return (
          <button
            key={i}
            aria-label={`${i} star`}
            role="radio"
            tabIndex={-1}
            onMouseEnter={() => setHoverIndex(i)}
            onMouseMove={() => setHoverIndex(i)}
            onClick={() => handleSelect(i)}
            onFocus={() => setHoverIndex(i)}
            onBlur={() => setHoverIndex(0)}
            style={{
              width: size,
              height: size,
              background: "transparent",
              border: "none",
              padding: 0,
            }}
            title={`${i} star`}
          >
            <StarSVG size={size} fill={fill} />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
