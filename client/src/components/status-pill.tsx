import React from "react";

type StatusVariant =
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "neutral"
  | "primary";

type StatusPillProps = {
  variant?: StatusVariant;
  children: React.ReactNode;
  className?: string;
};

export default function StatusPill({
  variant = "neutral",
  children,
  className = "",
}: StatusPillProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case "success":
        return "bg-emerald-600/10 text-emerald-700 border-emerald-600/20";
      case "danger":
        return "bg-red-700/10 text-red-700 border-red-700/20";
      case "warning":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
      case "info":
        return "bg-blue-600/10 text-blue-700 border-blue-600/20";
      case "primary":
        return "bg-sims-green-600/10 text-sims-green-700 border-sims-green-600/20";
      case "neutral":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getVariantClasses()} ${className}`}
    >
      {children}
    </span>
  );
} 
