import { GoPlus } from "react-icons/go";

type AddButtonProps = {
  onClick: () => void;
  size?: number; // Default size in pixels for flexibility
};

export default function AddButton({ onClick, size = 20 }: AddButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center bg-white text-sims-green-900 rounded hover:bg-sims-green-300 active:bg-sims-green-700 transition-all duration-150 font-bold"
      style={{ width: size, height: size, fontSize: size / 2 }}
      aria-label="Add"
    >
      <GoPlus size={size} />
    </button>
  );
}
