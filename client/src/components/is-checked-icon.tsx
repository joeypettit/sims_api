import { FaRegCircle } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";

type CheckOrEmptyIconProps = {
  isChecked: boolean;
  iconSize: string;
  forceGrey?: boolean;
};

export default function IsCheckedIcon({
  isChecked,
  iconSize,
  forceGrey = false,
}: CheckOrEmptyIconProps) {
  return (
    <div className="flex items-center justify-center text-2xl">
      {isChecked ? (
        <span className={forceGrey ? "text-stone-400" : "text-sims-green-900"}>
          <FaCircleCheck size={iconSize} />
        </span>
      ) : (
        <span className="text-gray-400">
          <FaRegCircle size={iconSize} />
        </span>
      )}
    </div>
  );
}
