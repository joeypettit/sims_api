import React from "react";

// Define types for button variants and sizes
type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "white"
  | "outline-danger"
  | "outline-primary"
  | "outline-success";
type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";
type ButtonTypes = "submit" | "reset" | "button" | undefined;

// Define the props type
export type ButtonProps = {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  type?: ButtonTypes;
  form?: string;
};

export default function Button({
  children,
  onClick,
  className = "",
  disabled = false,
  variant = "primary",
  size = "md",
  type = "button",
  form,
}: ButtonProps) {
  // Set button color based on the variant prop
  const getButtonClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-sims-green-600 hover:bg-sims-green-700 active:bg-sims-green-800 text-white border border-transparent";
      case "secondary":
        return "bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white border border-transparent";
      case "success":
        return "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white border border-transparent";
      case "danger":
        return "bg-red-500 hover:bg-red-600 active:bg-red-700 text-white border border-transparent";
      case "warning":
        return "bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white border border-transparent";
      case "white":
        return "text-gray-700 bg-white hover:bg-gray-100 active:bg-gray-200 active:shadow-inner";
      case "outline-danger":
        return "text-red-500 border border-red-200 bg-transparent hover:bg-red-50 active:bg-red-100";
      case "outline-primary":
        return "text-sims-green-600 border border-sims-green-200 bg-transparent hover:bg-sims-green-50 active:bg-sims-green-100";
      case "outline-success":
        return "text-emerald-600 border border-emerald-200 bg-transparent hover:bg-emerald-50 active:bg-emerald-100";
      default:
        return "bg-sims-green-600 hover:bg-sims-green-700 active:bg-sims-green-800 text-white border border-transparent";
    }
  };

  // Set button size based on the size prop
  const getSizeClasses = () => {
    switch (size) {
      case "xs":
        return "px-2 py-1 text-xs";
      case "sm":
        return "px-3 py-1.5 text-sm";
      case "md":
        return "px-4 py-2 text-md";
      case "lg":
        return "px-5 py-2.5 text-lg";
      case "xl":
        return "px-6 py-3 text-xl";
      default:
        return "px-4 py-2 text-md";
    }
  };

  return (
    <button
      onClick={onClick}
      type={type}
      form={form}
      disabled={disabled}
      className={`rounded-md font-semibold transition-all duration-200 
                  disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60
                  ${variant.startsWith('outline-') ? '' : variant == "white" ? "text-black" : "text-white"} 
                  ${getButtonClasses()} ${getSizeClasses()} ${className}`}
    >
      {children}
    </button>
  );
}
