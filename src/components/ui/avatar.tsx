import { cn, initials } from "@/lib/utils";

export function Avatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dim = size === "sm" ? "size-8 text-[10px]" : size === "lg" ? "size-14 text-base" : "size-10 text-xs";
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={cn("rounded-full object-cover", dim, className)}
      />
    );
  }
  return (
    <span
      className={cn(
        "grid place-items-center rounded-full bg-elevated font-medium text-accent hairline",
        dim,
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
