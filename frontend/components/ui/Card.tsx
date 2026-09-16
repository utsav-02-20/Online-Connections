import React, { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverEffect?: boolean;
  bordered?: boolean;
}

export const Card = ({
  children,
  hoverEffect = false,
  bordered = true,
  className = "",
  ...props
}: CardProps) => {
  return (
    <div
      className={`bg-white rounded-2xl p-6 shadow-xs ${
        bordered ? "border border-slate-200/80" : ""
      } ${
        hoverEffect
          ? "hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 transition-all duration-200"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
