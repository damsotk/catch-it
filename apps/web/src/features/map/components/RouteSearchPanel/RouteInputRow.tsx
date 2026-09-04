import type { ReactNode } from "react";

function Badge({
  tone,
  children,
}: {
  tone: "blue" | "gray";
  children: ReactNode;
}) {
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
  isFirst?: boolean;
  children: ReactNode;
};

export function RouteInputRow({
  icon,
  tone,
  isFirst,
  children,
}: RouteInputRowProps) {
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

export function RouteSubmitRow({
  onClick,
  disabled,
  children,
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group relative flex w-full cursor-pointer items-center gap-3 px-4 text-left transition-colors duration-200 hover:bg-white/[0.04] disabled:cursor-default disabled:hover:bg-transparent"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute left-[30px] top-0 h-4 w-px bg-white/10"
      />
      <span className="h-7 w-7 shrink-0" />
      <span className="flex-1 border-t border-white/10 py-3.5 text-sm font-semibold text-[#2ed058] transition-colors duration-200 group-hover:text-[#3fe06c] group-disabled:text-neutral-500 group-disabled:group-hover:text-neutral-500">
        {children}
      </span>
    </button>
  );
}
