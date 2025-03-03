import { NumericFormat } from "react-number-format";
import type { LineItemOption } from "../../app/types/line-item-option";
import OptionCostInput from "../../components/option-cost-input";
import OptionTierBadge from "../../components/option-tier-badge";
import {
  getOptionsTotalSalePrice,
  getOptionsPerUnitSalePrice,
} from "../../util/utils";
import type { LineItem } from "../../app/types/line-item";

type OptionFormProps = {
  option: LineItemOption;
  lineItem: LineItem;
  onChange: (updatedOption: LineItemOption) => void;
};

export default function OptionForm({
  option,
  lineItem,
  onChange,
}: OptionFormProps) {
  const optionsTotalSalePrice = getOptionsTotalSalePrice({
    option: option,
    lineItem: lineItem,
  });

  const optionsPerUnitSalePrice = getOptionsPerUnitSalePrice({
    option: option,
    lineItem: lineItem,
  });

  function onDescriptionChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const { value } = e.target;
    const newOption = structuredClone(option);
    newOption.description = value;
    onChange(newOption);
  }

  function onPriceAdjustmentChange(value: number | undefined) {
    const newOption = structuredClone(option);
    newOption.priceAdjustmentMultiplier = value;
    onChange(newOption);
  }

  function onPriceAdjustmentBlur(
    e: React.FocusEvent<HTMLInputElement, Element>
  ) {
    if (e.target.value.trim() == "") {
      onPriceAdjustmentChange(1);
    }
  }

  function renderOptionsTotalSalePrice() {
    if (typeof optionsTotalSalePrice == "number") {
      return <div>{`Total: $${optionsTotalSalePrice}`}</div>;
    }
    return (
      <div>{`Total: $${optionsTotalSalePrice.lowPriceInDollars} - $${optionsTotalSalePrice.highPriceInDollars}`}</div>
    );
  }

  function renderOptionsPerUnitSalePrice() {
    if (typeof optionsPerUnitSalePrice == "number") {
      return <div>{`Per Unit: $${optionsPerUnitSalePrice}`}</div>;
    }
    return (
      <div>{`Per Unit: $${optionsPerUnitSalePrice.lowPriceInDollars} - $${optionsPerUnitSalePrice.highPriceInDollars}`}</div>
    );
  }

  return (
    <div className="px-2">
      <div className="py-2 flex justify-start">
        <OptionTierBadge tier={option.optionTier}></OptionTierBadge>
      </div>
      <div className="grid grid-cols-2">
        <div className="p-2 rounded mr-2">
          <OptionCostInput option={option} onChange={onChange} />
        </div>
        <div className="p-2 rounded">
          <label htmlFor="marginDecimal">Adjustment Multiplier</label>
          <div className="py-1 flex flex-row justify-center items-center">
            <NumericFormat
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-sims-green-600 focus:border-sims-green-600"
              autoComplete="off"
              id="priceAdjustmentMultiplier"
              name="priceAdjustmentMultiplier"
              value={option.priceAdjustmentMultiplier}
              allowNegative={false}
              decimalScale={4}
              placeholder="1"
              onValueChange={(values) => {
                onPriceAdjustmentChange(values.floatValue);
              }}
              onBlur={(e) => onPriceAdjustmentBlur(e)}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center p-2 rounded my-2">
        <div>Sale Price</div>
        <div className="flex flex-row justify-center gap-6">
          {renderOptionsPerUnitSalePrice()}
          {renderOptionsTotalSalePrice()}
        </div>
      </div>
      <div className="p-2 rounded my-2">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          autoComplete="off"
          value={option.description || ""}
          onChange={onDescriptionChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-sims-green-600 focus:border-sims-green-600"
          rows={4}
          style={{ resize: "none" }}
        />
      </div>
    </div>
  );
}
