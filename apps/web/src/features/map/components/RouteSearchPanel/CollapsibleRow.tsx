import type { CSSProperties, ReactNode } from "react";

type CollapsibleRowProps = {
  expanded: boolean;
  delayMs: number;
  maxHeight: number;
  className?: string;
  children: ReactNode;
};

/** Animates a row between hidden (0 height) and its natural height, for staggered reveal/collapse sequences. */
export function CollapsibleRow({
  expanded,
  delayMs,
  maxHeight,
  className,
  children,
}: CollapsibleRowProps) {
  const style: CSSProperties = {
    maxHeight: expanded ? maxHeight : 0,
    opacity: expanded ? 1 : 0,
    transitionDelay: `${delayMs}ms`,
  };

  return (
    <div
      className={`overflow-hidden transition-all duration-300 ease-out ${className ?? ""}`}
      style={style}
    >
      {children}
    </div>
  );
}
