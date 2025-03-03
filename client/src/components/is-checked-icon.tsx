import { FaRegCircle } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";

type CheckOrEmptyIconProps = {
  isChecked: boolean;
  iconSize: string;
};

export default function IsCheckedIcon({
  isChecked,
  iconSize,
}: CheckOrEmptyIconProps) {
  return (
    <div className="flex items-center justify-center text-2xl">
      {isChecked ? (
        <span className="text-sims-green-900">
          <FaCircleCheck size={iconSize} />
        </span> // Checkmark
      ) : (
        <span className="text-gray-400">
          <FaRegCircle size={iconSize} />
        </span> // Empty circle
      )}
    </div>
  );
}
