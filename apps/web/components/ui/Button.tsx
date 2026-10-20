import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "ghost";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      primary:
        "bg-brand text-white hover:bg-brand-strong active:scale-[0.98] focus-visible:ring-brand",
      secondary:
        "bg-surface text-ink border border-border hover:bg-brand-soft hover:border-brand/40 active:scale-[0.98] focus-visible:ring-brand",
      accent:
        "bg-accent text-[#14201B] font-semibold hover:brightness-105 active:scale-[0.98] focus-visible:ring-accent shadow-sm",
      ghost:
        "bg-transparent text-ink hover:bg-brand-soft hover:text-brand focus-visible:ring-brand",
    };

    const sizeStyles = {
      sm: "h-9 px-3 text-xs rounded-control min-w-[36px]",
      md: "min-h-[44px] px-5 py-2.5 text-sm rounded-control min-w-[44px]", // Minimum 44px touch target (NFR-07)
      lg: "min-h-[48px] px-7 py-3 text-base rounded-control min-w-[48px]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={twMerge(
          clsx(
            "inline-flex items-center justify-center font-medium transition-all duration-200 select-none",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
            "motion-reduce:transition-none motion-reduce:transform-none",
            variantStyles[variant],
            sizeStyles[size],
            className
          )
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
