import type { ReactNode } from "react";

function Badge({ tone, children }: { tone: "blue" | "gray"; children: ReactNode }) {
  return (
    <span
      className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
        tone === "blue" ? "bg-[#0a84ff]" : "bg-[#3a3f41]"
      }`}
    >
      {children}
    </span>
  );
}

type RouteInputRowProps = {
  icon: ReactNode;
  tone: "blue" | "gray";
  /** First row has no divider and its connector line starts at the icon instead of the row's top edge. */
  isFirst?: boolean;
  children: ReactNode;
};

/** A single "stop" row: icon badge, connector line down to the next row, and a divider that skips the icon column. */
export function RouteInputRow({ icon, tone, isFirst, children }: RouteInputRowProps) {
  return (
    <div className="relative flex items-center gap-3 px-4">
      <span
        aria-hidden
        className={`pointer-events-none absolute left-[30px] bottom-0 w-px bg-white/10 ${
          isFirst ? "top-1/2" : "top-0"
        }`}
      />
      <Badge tone={tone}>{icon}</Badge>
      <div
        className={`flex min-w-0 flex-1 items-center justify-between gap-2 py-3.5 ${
          isFirst ? "" : "border-t border-white/10"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

/** The submit row: no icon, just a short connector stub poking into it, styled to stand out via color rather than a fill. */
export function RouteSubmitRow({
  onClick,
  children,
}: {
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex w-full cursor-pointer items-center gap-3 px-4 text-left transition-colors duration-200 hover:bg-white/[0.04]"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute left-[30px] top-0 h-4 w-px bg-white/10"
      />
      <span className="h-7 w-7 shrink-0" />
      <span className="flex-1 border-t border-white/10 py-3.5 text-sm font-semibold text-[#2ed058] transition-colors duration-200 group-hover:text-[#3fe06c]">
        {children}
      </span>
    </button>
  );
}
