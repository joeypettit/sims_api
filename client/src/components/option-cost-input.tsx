import { useState } from "react";
import { LineItemOption } from "../app/types/line-item-option";
import { NumericFormat } from "react-number-format";

type OptionCostInputProps = {
  option: LineItemOption;
  onChange: (updatedOption: LineItemOption) => void;
};

export default function OptionCostInput({
  option,
  onChange,
}: OptionCostInputProps) {
  const [useExactCost, setUseExactCost] = useState(() => {
    if (option.exactCostInDollarsPerUnit != null) return true;
    return false;
  });

  const handleToggle = (isExact: boolean) => {
    const newOption = structuredClone(option);
    if (isExact) {
      newOption.highCostInDollarsPerUnit = null;
      newOption.lowCostInDollarsPerUnit = null;
      newOption.exactCostInDollarsPerUnit = 0;
    }
    if (!isExact) {
      newOption.highCostInDollarsPerUnit = 0;
      newOption.lowCostInDollarsPerUnit = 0;
      newOption.exactCostInDollarsPerUnit = null;
    }
    onChange(newOption);
    setUseExactCost(isExact);
  };

  function onLowCostChange(value: number | undefined) {
    if (!value) return;
    const newOption = structuredClone(option);
    newOption.exactCostInDollarsPerUnit = null;
    newOption.lowCostInDollarsPerUnit = value;
    onChange(newOption);
  }
  function onHighCostChange(value: number | undefined) {
    if (!value) return;
    const newOption = structuredClone(option);
    newOption.exactCostInDollarsPerUnit = null;
    newOption.highCostInDollarsPerUnit = value;
    onChange(newOption);
  }

  function onExactCostChange(value: number | undefined) {
    if (!value) return;
    const newOption = structuredClone(option);
    newOption.exactCostInDollarsPerUnit = value;
    newOption.highCostInDollarsPerUnit = null;
    newOption.lowCostInDollarsPerUnit = null;
    onChange(newOption);
  }

  return (
    <div className="pr-2">
      <div></div>
      <div className="flex flex-row justify-between">
        <div>
          Cost <span className="text-slate-500">(per unit)</span>:
        </div>
        <div className="flex flex-row">
          <div className="flex px-1 flex-row justify-center items-center border-r border-gray-300">
            <label className="pr-1">Range</label>
            <input
              type="checkbox"
              autoComplete="off"
              checked={!useExactCost}
              onChange={() => handleToggle(false)}
              className="cursor-pointer bg-sims-green-900"
            />
          </div>
          <div className="flex flex-row justify-center items-center px-1">
            <label className="pr-1">Exact</label>
            <input
              type="checkbox"
              autoComplete="off"
              checked={useExactCost}
              onChange={() => handleToggle(true)}
              className="cursor-pointer sims-green-900 "
            />
          </div>
        </div>
      </div>

      {useExactCost ? (
        <div className="py-1">
          <label htmlFor="exactCostInDollarsPerUnit" className="hidden mb-1">
            Exact Cost (Per Unit)
          </label>
          <div className="flex flex-row justify-center items-center">
            <NumericFormat
              className="border border-gray-300 p-1 rounded w-full"
              autoComplete="off"
              id="exactCostInDollarsPerUnit"
              name="exactCostInDollarsPerUnit"
              value={option.exactCostInDollarsPerUnit}
              prefix="$"
              allowNegative={false}
              decimalScale={2}
              placeholder="Exact Cost"
              disabled={!useExactCost}
              onValueChange={(values) => {
                onExactCostChange(values.floatValue);
              }}
            />
          </div>
        </div>
      ) : (
        <div className="py-1">
          <label className="mb-1 hidden">Cost Range (Per Unit):</label>
          <div className="flex space-x-2">
            <div className="flex flex-row justify-center items-center">
              <NumericFormat
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-sims-green-600 focus:border-sims-green-600"
                autoComplete="off"
                id="exactCostInDollarsPerUnit"
                name="exactCostInDollarsPerUnit"
                value={option.lowCostInDollarsPerUnit}
                prefix="$"
                allowNegative={false}
                decimalScale={2}
                placeholder="Low Cost"
                disabled={useExactCost}
                onValueChange={(values) => {
                  onLowCostChange(values.floatValue);
                }}
              />
              <span className="px-2"> - </span>
              <NumericFormat
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-sims-green-600 focus:border-sims-green-600"
                autoComplete="off"
                id="exactCostInDollarsPerUnit"
                name="exactCostInDollarsPerUnit"
                value={option.highCostInDollarsPerUnit}
                prefix="$"
                allowNegative={false}
                decimalScale={2}
                placeholder="High Cost"
                disabled={useExactCost}
                onValueChange={(values) => {
                  onHighCostChange(values.floatValue);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
