import React, { ReactNode } from "react";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) => {
  return (
    <div
      className={`bg-white border border-slate-200/80 rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-3 shadow-xs ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl mb-1 shadow-xs">
        {icon || "🔍"}
      </div>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      {description && (
        <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};
