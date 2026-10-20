import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export function Container({ className, children, ...props }: ContainerProps) {
  return (
    <div
      className={twMerge(
        clsx(
          "w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8",
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}
