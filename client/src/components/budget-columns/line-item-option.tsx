import type { LineItemOption } from "../../app/types/line-item-option";
import IsCheckedIcon from "../is-checked-icon";
import type { LineItem } from "../../app/types/line-item";
import {
  getOptionsTotalSalePrice,
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

  return (
    <div
      onClick={() =>
        props.onOptionSelection({
          optionToSelect: props.lineItemOption,
        })
      }
      className={`cursor-pointer hover:shadow-inner relative text-center rounded-sm p-3 ${
        props.lineItemOption.isSelected ? "bg-sims-green-50 shadow-inner" : ""
      }`}
    >
      <div className="absolute right-1 top-1">
        <IsCheckedIcon
          isChecked={props.lineItemOption.isSelected}
          iconSize="1rem"
        />
      </div>
      <p
        className={`text-sm ${
          props.lineItemOption.isSelected ? "font-bold" : "font-normal"
        }`}
      >
        {getDisplayedPrice()}
      </p>
      <p className="text-stone-600 text-xs">
        {props.lineItemOption.description}
      </p>
    </div>
  );
}
