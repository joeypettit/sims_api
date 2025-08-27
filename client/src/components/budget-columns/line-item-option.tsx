import type { LineItemOption } from "../../app/types/line-item-option";
import IsCheckedIcon from "../is-checked-icon";
import type { LineItem } from "../../app/types/line-item";
import {
  getOptionsTotalSalePrice,
  getOptionsPerUnitSalePrice,
  formatNumberWithCommas,
} from "../../util/utils";

export type LineItemOptionDisplayProps = {
  lineItemOption: LineItemOption;
  lineItem: LineItem;
  onOptionSelection: ({
    optionToSelect,
  }: {
    optionToSelect: LineItemOption;
  }) => void;
};

export default function LineItemOptionDisplay({
  props,
}: {
  props: LineItemOptionDisplayProps;
}) {
  function getDisplayedPrice() {
    const salePrice = getOptionsTotalSalePrice({
      option: props.lineItemOption,
      lineItem: props.lineItem,
    });
    if (typeof salePrice == "number") {
      return `$${salePrice}`;
    }
    if (salePrice.lowPriceInDollars == salePrice.highPriceInDollars) {
      return `$${salePrice.lowPriceInDollars}`;
    }
    const lowPrice = formatNumberWithCommas(salePrice.lowPriceInDollars);
    const highPrice = formatNumberWithCommas(salePrice.highPriceInDollars);
    return `$${lowPrice} - $${highPrice}`;
  }

  function getDisplayedPerUnitPrice() {
    const perUnitPrice = getOptionsPerUnitSalePrice({
      option: props.lineItemOption,
      lineItem: props.lineItem,
    });
    
    if (typeof perUnitPrice == "number") {
      return `$${perUnitPrice}`;
    }
    if (perUnitPrice.lowPriceInDollars == perUnitPrice.highPriceInDollars) {
      return `$${perUnitPrice.lowPriceInDollars}`;
    }
    const lowPrice = formatNumberWithCommas(perUnitPrice.lowPriceInDollars);
    const highPrice = formatNumberWithCommas(perUnitPrice.highPriceInDollars);
    return `$${lowPrice} - $${highPrice}`;
  }

  function getBackgroundClass() {
    if (!props.lineItemOption.isSelected) return "";
    
    return props.lineItem.quantity === 0 
      ? "bg-stone-100 shadow-inner" 
      : "bg-sims-green-50 shadow-inner";
  }

  return (
    <div
      onClick={() =>
        props.onOptionSelection({
          optionToSelect: props.lineItemOption,
        })
      }
      className={`cursor-pointer hover:shadow-inner relative text-center rounded-sm p-3 ${getBackgroundClass()}`}
    >
      <div className="absolute right-1 top-1">
        <IsCheckedIcon
          isChecked={props.lineItemOption.isSelected}
          iconSize="1rem"
          forceGrey={props.lineItem.quantity === 0}
        />
      </div>
      {props.lineItem.quantity === 0 ? (
        <div className="text-center">
          <p className={`text-sm ${props.lineItemOption.isSelected ? "font-bold" : "font-normal"} text-gray-500`}>
            {getDisplayedPerUnitPrice()} / unit
          </p>
          <p className="text-xs text-gray-500">
            
          </p>
        </div>
      ) : (
        <p
          className={`text-sm ${
            props.lineItemOption.isSelected ? "font-bold" : "font-normal"
          }`}
        >
          {getDisplayedPrice()}
        </p>
      )}
      <hr className="border-gray-200 my-1 mx-10" />
      <p className={`text-xs ${props.lineItem.quantity === 0 ? "text-gray-500" : "text-stone-600"}`}>
        {props.lineItemOption.description}
      </p>
    </div>
  );
}
