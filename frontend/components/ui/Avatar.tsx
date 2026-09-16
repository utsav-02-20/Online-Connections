import React from "react";

export interface AvatarProps {
  src?: string | null;
  username: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const Avatar = ({
  src,
  username,
  size = "md",
  className = "",
}: AvatarProps) => {
  const sizeStyles = {
    sm: "w-8 h-8 text-xs font-semibold",
    md: "w-10 h-10 text-sm font-semibold",
    lg: "w-16 h-16 text-xl font-bold",
    xl: "w-24 h-24 text-3xl font-bold border-4 border-white shadow-xl",
  };

  const initials = username ? username.slice(0, 2).toUpperCase() : "OC";

  return (
    <div
      className={`relative rounded-full overflow-hidden bg-slate-100 border border-slate-200 text-blue-600 flex items-center justify-center shrink-0 uppercase transition-transform ${sizeStyles[size]} ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={`@${username}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Hide image on error and fall back to initials
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};
