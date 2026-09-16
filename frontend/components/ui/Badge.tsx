import React, { ReactNode } from "react";

export interface BadgeProps {
  children: ReactNode;
  variant?: "success" | "warning" | "info" | "neutral" | "danger";
  size?: "sm" | "md";
  className?: string;
}

export const Badge = ({
  children,
  variant = "info",
  size = "md",
  className = "",
}: BadgeProps) => {
  const variantStyles = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    danger: "bg-red-50 text-red-700 border-red-200",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px] font-semibold tracking-wider",
    md: "px-2.5 py-1 text-xs font-semibold tracking-wide",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
