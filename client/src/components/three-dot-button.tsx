import { HiDotsVertical } from "react-icons/hi";

type ThreeDotButtonProps = {
  onClick: () => void;
  menuIsOpen?: boolean;
};

export default function ThreeDotButton({
  onClick,
  menuIsOpen = false,
}: ThreeDotButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center space-y-1 p-1 rounded  hover:bg-gray-100 ${
        menuIsOpen && "bg-gray-100 shadow-inner"
      }`}
      aria-label="More options"
    >
      <HiDotsVertical />
    </button>
  );
}
