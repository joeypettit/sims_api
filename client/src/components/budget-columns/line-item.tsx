import { LineItemOption } from "../../app/types/line-item-option";
import { RiDraggable } from "react-icons/ri";
import type { LineItem } from "../../app/types/line-item";
import LineItemOptionDisplay from "./line-item-option";
import QuantityInput from "../quantity-input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOptionSelection, updateLineItemQuantity } from "../../api/api";
import type { ProjectArea } from "../../app/types/project-area";
import { getCurrentlySelectedOption } from "../../util/utils";
import { getOptionsTotalSalePrice } from "../../util/utils";
import { formatNumberWithCommas } from "../../util/utils";
import LineItemActionsButton from "../line-item-actions-button";
import { Draggable } from "@hello-pangea/dnd";

export type LineItemDisplayProps = {
  lineItem: LineItem;
  index: number;
  projectId: string;
  projectAreaId: string;
};

export default function LineItemDisplay({
  lineItem,
  index,
  projectId,
  projectAreaId
}: LineItemDisplayProps) {
  const queryClient = useQueryClient();
  const quantity = lineItem.quantity ? lineItem.quantity : 0;

  function onQuantityChange(value: number) {
    updateLineItemQuantityMutation.mutate({
      lineItemId: lineItem.id,
      quantity: value,
    });
  }

  const updateLineItemQuantityMutation = useMutation({
    mutationFn: updateLineItemQuantity,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["area"] });

      const previousProjectArea = queryClient.getQueryData(["area"]);

      queryClient.setQueryData(["area"], (oldData: ProjectArea | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          lineItemGroups: oldData.lineItemGroups.map((group) => {
            if (group.id !== lineItem.lineItemGroupId) return group;
            return {
              ...group,
              lineItems: group.lineItems.map((item: LineItem) => {
                if (lineItem.id !== item.id) return item;
                return {
                  ...item,
                  quantity: variables.quantity,
                };
              }),
            };
          }),
        };
      });

      return previousProjectArea;
    },
    onSuccess: () => {
      // Invalidate both the area cost and project cost queries using passed props
      queryClient.invalidateQueries({ queryKey: ["area-cost", projectAreaId] });
      queryClient.invalidateQueries({ queryKey: ["project-cost", projectId] });
    }
  });

  function getCurrentLineTotal() {
    const selectedOption = getCurrentlySelectedOption(lineItem);
    if (selectedOption) {
      const lineTotal = getOptionsTotalSalePrice({
        option: selectedOption,
        lineItem: lineItem,
      });
      if (lineTotal == 0) return "-";
      else if (typeof lineTotal === "number")
        return `$${formatNumberWithCommas(lineTotal)}`;
      else if (lineTotal?.highPriceInDollars <= 0) return "-";
      const lowPrice = formatNumberWithCommas(lineTotal.lowPriceInDollars);
      const highPrice = formatNumberWithCommas(lineTotal.highPriceInDollars);
      return `$${lowPrice} - $${highPrice}`;
    }
    return "-";
  }

  const updateOptionSelectionMutation = useMutation({
    mutationFn: updateOptionSelection,
    onMutate: async (variables) => {
      const { optionToSelect } = variables;

      await queryClient.cancelQueries({ queryKey: ["area"] });

      const previousProjectArea = queryClient.getQueryData(["area"]);

      queryClient.setQueryData(["area"], (oldData: ProjectArea | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          lineItemGroups: oldData.lineItemGroups.map((group) => {
            if (group.id !== lineItem.lineItemGroupId) return group; // Not the target group, keep it the same
            return {
              ...group,
              lineItems: group.lineItems.map((item: LineItem) => {
                if (lineItem.id !== item.id) return item;
                return {
                  ...item,
                  lineItemOptions: lineItem.lineItemOptions.map((option) =>
                    option.id === optionToSelect?.id
                      ? { ...option, isSelected: true }
                      : { ...option, isSelected: false }
                  ),
                };
              }),
            };
          }),
        };
      });
      return { previousProjectArea };
    },
    onError: (error, _variables, context) => {
      console.log("There was an ERROR:", error);
      if (context?.previousProjectArea) {
        queryClient.setQueryData(["area"], context.previousProjectArea);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["area"] });
      queryClient.invalidateQueries({ queryKey: ["area-cost", projectAreaId] });
      queryClient.invalidateQueries({ queryKey: ["project-cost", projectId] });
    },
  });
  function getSortedOptions() {
    const sorted = lineItem.lineItemOptions.sort((a: LineItemOption, b: LineItemOption) => a.optionTier.tierLevel - b.optionTier.tierLevel)
    return sorted
  }

  async function onOptionSelection({
    optionToSelect,
  }: {
    optionToSelect: LineItemOption | undefined;
  }) {
    const optionToUnselect = getCurrentlySelectedOption(lineItem);
    if (optionToSelect?.id == optionToUnselect?.id) {
      optionToSelect = undefined;
    }

    updateOptionSelectionMutation.mutate({
      optionToSelect: optionToSelect,
      optionToUnselect: optionToUnselect,
      lineItem: lineItem,
    });
  }

  return (
    <Draggable index={index} draggableId={lineItem.id}>
      {(provided) => (
        <>
        <div className="grid grid-cols-5 gap-2 py-4 px-1" ref={provided.innerRef} {...provided.draggableProps}>
          <div className="flex flex-row border-e border-gray-100" style={{minWidth: "225px"}}>
            <div className="flex justify-center items-center px-1"{...provided.dragHandleProps}><RiDraggable /></div>
            <div className="flex flex-col text-center justify-between px-2 pb-2">
              <div className="flex flex-row justify-between w-full">
                <h1 className="text-left">{lineItem.name}</h1>
                <LineItemActionsButton lineItem={lineItem} projectId={projectId} projectAreaId={projectAreaId} />
              </div>
              <div className="flex flex-col items-center gap-1">
                <QuantityInput value={quantity} onChange={onQuantityChange} />
                <span className="text-sm text-gray-600 pl-1">{lineItem?.unit?.name || '-'}</span>
              </div>
            </div>
          </div>
          {getSortedOptions().map((option, index) => {
            return (
              <LineItemOptionDisplay
                key={`product-option-${index}`}
                props={{
                  lineItemOption: option,
                  lineItem: lineItem,
                  onOptionSelection: onOptionSelection,
                }}
              />
            );
          })}
          <div className="flex justify-end items-center text-sm font-bold pr-4 col-end-6 border-l border-gray-100">
            {getCurrentLineTotal()}
          </div>
          {/* <hr className="border border-gray-100 mx-4" /> */}

        </div>
        <hr className="border-gray-100 mx-4" />
        </>
      )}

    </Draggable>
  );
}
