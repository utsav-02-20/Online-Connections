import React from "react";

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose?: () => void;
}

export const Toast = ({ message, type = "info", onClose }: ToastProps) => {
  const typeStyles = {
    success: "bg-emerald-600 text-white shadow-emerald-500/20",
    error: "bg-red-600 text-white shadow-red-500/20",
    info: "bg-slate-900 text-white shadow-slate-900/20",
  };

  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
  };

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border border-white/10 animate-fade-in text-sm font-medium ${typeStyles[type]}`}
    >
      <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">
        {icons[type]}
      </span>
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 text-white/70 hover:text-white text-xs font-bold p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  );
};
