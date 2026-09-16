import React, { InputHTMLAttributes, ReactNode, useState } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isPassword?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      isPassword = false,
      type = "text",
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    const actualType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={actualType}
            className={`w-full bg-white border text-slate-900 placeholder:text-slate-400 rounded-xl text-sm px-4 py-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs ${
              leftIcon ? "pl-10" : ""
            } ${isPassword || rightIcon ? "pr-11" : ""} ${
              error
                ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                : "border-slate-200 hover:border-slate-300 focus:border-blue-600"
            } ${className}`}
            {...props}
          />

          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none text-xs font-medium px-1 py-0.5 rounded transition-colors"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          ) : (
            rightIcon && (
              <div className="absolute right-3.5 text-slate-400 flex items-center">
                {rightIcon}
              </div>
            )
          )}
        </div>

        {error ? (
          <p className="text-xs text-red-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
