import type { CSSProperties, ReactNode } from "react";

const ROW_COUNT = 5;
const ROW_STAGGER_MS = 70;
const ROW_MAX_HEIGHT = 56;

type CollapsibleRowProps = {
  expanded: boolean;
  order: number;
  className?: string;
  children: ReactNode;
};

export function CollapsibleRow({
  expanded,
  order,
  className = "",
  children,
}: CollapsibleRowProps) {
  const staggerStep = expanded ? order : ROW_COUNT - 1 - order;

  const style: CSSProperties = {
    maxHeight: expanded ? ROW_MAX_HEIGHT : 0,
    opacity: expanded ? 1 : 0,
    transitionDelay: `${staggerStep * ROW_STAGGER_MS}ms`,
  };

  return (
    <div
      className={`overflow-hidden transition-all duration-300 ease-out ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
