import { LineItemUnit } from "../app/types/line-item-unit";
import Button from "./button";
import IconButton from "./icon-button";
import { FaPlus, FaTrash } from "react-icons/fa";
import { FiAlertCircle } from "react-icons/fi";

type UnitsListProps = {
  units: LineItemUnit[];
  onRemoveUnit: (unitId: string) => void;
  onAddUnit: () => void;
  errorMessage: string | null;
  isRemoveLoading: boolean;
};

export default function UnitsList({
  units,
  onRemoveUnit,
  onAddUnit,
  errorMessage,
  isRemoveLoading
}: UnitsListProps) {
  return (
    <div className="border border-gray-300 p-4 rounded shadow">
      <div className="flex flex-row mb-4 justify-between items-center">
        <h2 className="font-bold">Line Item Units</h2>
        <Button
          size="xs"
          variant="white"
          onClick={onAddUnit}
          className="py-1"
        >
          <FaPlus />
        </Button>
      </div>
      <div>
        {errorMessage && (
          <div className="mb-2 text-sm text-red-600 bg-red-50 p-2 rounded flex items-center gap-2">
            <FiAlertCircle size={20} />
            {errorMessage}
          </div>
        )}
        <ul>
          {units.map((unit) => (
            <li
              key={unit.id}
              className="group p-2 bg-white odd:bg-sims-green-100 rounded flex justify-between items-center hover:bg-sims-green-200 active:shadow-inner"
            >
              <span>{unit.name}</span>
              <IconButton
                icon={<FaTrash />}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveUnit(unit.id);
                }}
                disabled={isRemoveLoading}
                className="opacity-0 group-hover:opacity-100"
                title="Delete unit"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 