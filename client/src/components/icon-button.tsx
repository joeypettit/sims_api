import React from "react";

type IconButtonProps = {
  icon: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  color?: string;
  disabled?: boolean;
  className?: string;
  title?: string;
};

export default function IconButton({
  icon,
  onClick,
  color = "text-gray-600",
  disabled = false,
  className = "",
  title
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${color} ${className}`}
    >
      {icon}
    </button>
  );
} 