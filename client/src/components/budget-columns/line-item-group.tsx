import { LineItemGroup } from "../../app/types/line-item-group";
import LineItemDisplay from "./line-item";
import CollapsibleDiv from "../collapsible-div";
import { formatNumberWithCommas } from "../../util/utils";
import Button from "../button";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBlankLineItem, setGroupIsOpen, setLineItemIndex } from "../../api/api";
import { useEffect, useState } from "react";
import { Draggable, Droppable, DragDropContext, DropResult } from "@hello-pangea/dnd";
import { LineItem } from "../../app/types/line-item";
import { ProjectArea } from "../../app/types/project-area";

export type LineItemGroupDisplayProps = {
  group: LineItemGroup;
  index: number;
  projectId: string;
  projectAreaId: string;
};

export default function LineItemGroupDisplay({
  group,
  index,
  projectId,
  projectAreaId
}: LineItemGroupDisplayProps) {
  const queryClient = useQueryClient();

  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(() => group.isOpen)

  function getGroupsTotalSalePrice() {
    if (group.totalSalePrice) {
      if (
        group.totalSalePrice?.lowPriceInDollars <= 0 &&
        group.totalSalePrice?.highPriceInDollars <= 0
      ) {
        return "-";
      }
      const lowPrice = formatNumberWithCommas(
        group.totalSalePrice?.lowPriceInDollars
      );
      const highPrice = formatNumberWithCommas(
        group.totalSalePrice?.highPriceInDollars
      );
      return `$${lowPrice} - $${highPrice}`;
    }
    return "-";
  }

  const createLineItemMutation = useMutation({
    mutationFn: async ({ groupId }: { groupId: string }) => {
      const result = await createBlankLineItem({ groupId });
      return result;
    },
    onSuccess: (data) => {
      navigate(`/edit-line-item/${data.id}`);
    },
    onError: (error) => {
      console.error("Error creating line item:", error);
      throw Error(`Error creating line item: ${error}`);
    },
  });

  const setIsOpenMutation = useMutation({
    mutationFn: async ({ groupId, isOpen }: { groupId: string, isOpen: boolean }) => {
      const result = await setGroupIsOpen({ groupId, isOpen });
      return result;
    },
    onMutate: ({ isOpen }) => {
      setIsOpen(isOpen)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["area"] })
    },
    onError: (error) => {
      console.error("Error setting isOpen", error);
      throw Error(`Error setting isOpen: ${error}`);
    },
  });

  const changeLineItemIndexMutation = useMutation({
    mutationFn: async ({ lineItemId, newIndex }: { lineItemId: string, newIndex: number }) => {
      const result = await setLineItemIndex({ groupId: group.id, lineItemId, newIndex });
      return result;
    },
    onMutate: async ({ lineItemId, newIndex }) => {
      await queryClient.cancelQueries({ queryKey: ["area"] });
      const previousArea: ProjectArea | undefined = queryClient.getQueryData(["area"]);

      if (previousArea) {
        queryClient.setQueryData(["area"], {
          ...previousArea,
          lineItemGroups: previousArea.lineItemGroups.map(g => {
            if (g.id !== group.id) return g;
            
            const lineItems = [...g.lineItems];
            const oldIndex = lineItems.findIndex(item => item.id === lineItemId);
            const [movedItem] = lineItems.splice(oldIndex, 1);
            lineItems.splice(newIndex, 0, movedItem);
            
            return {
              ...g,
              lineItems
            };
          })
        });
      }
      return { previousArea };
    },
    onError: (error, variables, context) => {
      console.error("Error reordering line items:", error);
      if (context?.previousArea) {
        queryClient.setQueryData(["area"], context.previousArea);
      }
    }
  });

  function handleCreateLineItem() {
    createLineItemMutation.mutate({ groupId: group.id });
  }

  function handleToggleOpenGroup() {
    setIsOpenMutation.mutate({ groupId: group.id, isOpen: !isOpen });
  }

  const handleLineItemDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;

    const lineItemId = result.draggableId;
    const newIndex = result.destination.index;

    changeLineItemIndexMutation.mutate({ lineItemId, newIndex });
  };

  useEffect(() => {
    setIsOpen(group.isOpen); // Sync state with updated prop
  }, [group.isOpen]);

  return (
    <Draggable index={index} draggableId={group.id}>
      {(provided) => (
        <div className="py-2" ref={provided.innerRef} {...provided.draggableProps} >
          <CollapsibleDiv title={group.name} price={getGroupsTotalSalePrice()} isOpen={isOpen} setIsOpen={handleToggleOpenGroup} provided={provided}>
          <DragDropContext onDragEnd={handleLineItemDragEnd}>
            <Droppable droppableId={group.id}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {group.lineItems.map((lineItem, index) => {
                    return (
                      <LineItemDisplay
                        key={lineItem.id}
                        lineItem={lineItem}
                        index={index}
                        projectId={projectId}
                        projectAreaId={projectAreaId}
                      />
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
            <div className="grid grid-cols-5 gap-4 py-2 pl-4">
              <div>
                <Button className="border-b-2 border-gray-100" size={"xs"} variant="white" onClick={handleCreateLineItem}>
                  + Add Line
                </Button>
              </div>
              <div></div>
            </div>
          </CollapsibleDiv>
        </div>)}
    </Draggable>
  );
}
