type LineBadgeProps = {
  name: string | null;
  color: string;
  variant?: "solid" | "outline";
  className?: string;
};

export function LineBadge({
  name,
  color,
  variant = "solid",
  className = "",
}: LineBadgeProps) {
  if (variant === "outline") {
    return (
      <span
        className={`rounded-md border px-1.5 py-px text-[11px] font-bold leading-4 ${className}`}
        style={{
          color,
          borderColor: `${color}66`,
          backgroundColor: `${color}1f`,
        }}
      >
        {name}
      </span>
    );
  }

  return (
    <span
      className={`rounded-full px-2 py-0.5 font-bold text-white ${className}`}
      style={{ backgroundColor: color }}
    >
      {name}
    </span>
  );
}
