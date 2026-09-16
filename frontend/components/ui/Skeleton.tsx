import React, { HTMLAttributes } from "react";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string;
  height?: string;
}

export const Skeleton = ({
  variant = "text",
  width,
  height,
  className = "",
  style,
  ...props
}: SkeletonProps) => {
  const variantStyles = {
    text: "h-4 rounded-md w-full",
    circular: "rounded-full w-12 h-12",
    rectangular: "rounded-2xl h-32 w-full",
  };

  return (
    <div
      className={`bg-slate-200 animate-pulse ${variantStyles[variant]} ${className}`}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
};

export const UserCardSkeleton = () => (
  <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center justify-between shadow-xs animate-pulse">
    <div className="flex items-center gap-3">
      <Skeleton variant="circular" className="w-12 h-12" />
      <div className="space-y-2">
        <Skeleton variant="text" className="w-32 h-4" />
        <Skeleton variant="text" className="w-48 h-3" />
      </div>
    </div>
    <Skeleton variant="rectangular" className="w-24 h-9 rounded-xl" />
  </div>
);
