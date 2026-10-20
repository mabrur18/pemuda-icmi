import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "brand" | "accent" | "success" | "warning" | "danger";
  size?: "sm" | "md";
}

export function Chip({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: ChipProps) {
  const variantStyles = {
    default: "bg-surface text-muted border border-border hover:border-brand/40",
    brand: "bg-brand-soft text-brand font-medium",
    accent: "bg-accent/20 text-[#14201B] dark:text-[#F0B945] font-semibold border border-accent/40",
    success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300",
    danger: "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300",
  };

  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-xs",
  };

  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center rounded-full font-medium transition-colors select-none",
          variantStyles[variant],
          sizeStyles[size],
          className
        )
      )}
      {...props}
    >
      {children}
    </span>
  );
}
