import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "../lib/utils";

type BadgeProps = ComponentPropsWithoutRef<"span"> & {
  variant?: "default" | "outline" | "ghost";
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant = "default", ...props }, ref) => {
  const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
    default: "bg-accent-600/80 text-foreground border border-accent-500/40",
    outline: "border border-accent-400/60 text-accent-200",
    ghost: "border border-transparent bg-accent-500/10 text-accent-200",
  };

  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-[0.2em]",
        "transition-colors duration-200",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});

Badge.displayName = "Badge";
