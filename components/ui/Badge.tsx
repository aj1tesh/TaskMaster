import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "accent";
}

export function Badge({ variant = "default", className = "", children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-raised text-text-muted border-border",
    accent: "bg-accent/10 text-accent border-accent/30",
  };

  return (
    <span
      className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-mono ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
