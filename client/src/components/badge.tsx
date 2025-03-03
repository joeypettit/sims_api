interface BadgeProps {
  text: string;
  color?: string; // Allows you to pass a custom color
  textColor?: string; // Allows you to customize the text color
}

function Badge({
  text,
  color = "bg-blue-500",
  textColor = "text-white",
}: BadgeProps) {
  return (
    <span
      className={`${color} ${textColor} px-3 py-1 rounded-full text-sm font-semibold`}
    >
      {text}
    </span>
  );
}

export default Badge;
