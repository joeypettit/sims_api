import prisma from "../../prisma/prisma-client";
import { lineItemFullSelect } from "./query-objects";


export default class LineItemsRepo {

  async findById({ lineItemId }: { lineItemId: string }) {
    try {
      const result = await prisma.lineItem.findUnique({
        where: {
          id: lineItemId,
        },
        ...lineItemFullSelect,
      });
      return result;
    }
    catch (error) {
      throw Error(`Error finding lineItem with id ${lineItemId}`)
    }
  }

  async updateIndexInGroup({ lineItemId, indexInGroup }: { lineItemId: string, indexInGroup: number }) {
    try {
      const result = await prisma.lineItem.update({
        where: {
          id: lineItemId,
        },
        data: {
          indexInGroup: indexInGroup
        },
        ...lineItemFullSelect
      });
      return result;
    }
    catch (error) {
      throw Error(`Error updating index for lineItem with id ${lineItemId}`)
    }
  }

  async setLineItemIndexInGroup({ lineItemId, groupId, newIndex }: { lineItemId: string, groupId: string, newIndex: number }) {
    try {
      // Fetch all items in the group, ordered by their current index
      const lineItemsInGroup = await prisma.lineItem.findMany({
        where: {
          lineItemGroupId: groupId
        },
        orderBy: [
          { indexInGroup: 'asc' },
          { id: 'asc' } // Use ID as tiebreaker for duplicate indices
        ]
      });

      const movedItemIndex = lineItemsInGroup.findIndex(item => item.id === lineItemId);
      
      if (movedItemIndex === -1) {
        throw new Error("Line item not found in group");
      }

      // If already at the target position, no change needed
      if (movedItemIndex === newIndex) {
        return await prisma.lineItem.findUnique({
          where: { id: lineItemId },
          ...lineItemFullSelect
        });
      }

      // Remove the moved item and insert it at the new position
      const reorderedItems = [...lineItemsInGroup];
      const [movedItem] = reorderedItems.splice(movedItemIndex, 1);
      reorderedItems.splice(newIndex, 0, movedItem);

      // Reindex all items sequentially (0, 1, 2, 3...)
      const itemsToUpdate = reorderedItems.map((item, index) => ({
        id: item.id,
        updatedIndex: index
      }));

      // Update all items in a transaction
      await prisma.$transaction(
        itemsToUpdate.map((item) =>
          prisma.lineItem.update({
            where: { id: item.id },
            data: { indexInGroup: item.updatedIndex }
          })
        )
      );

      // Return the moved line item with full select
      return await prisma.lineItem.findUnique({
        where: { id: lineItemId },
        ...lineItemFullSelect
      });
    } catch (error) {
      throw new Error(`Error setting line item index in group: ${lineItemId} - ${error}`);
    }
  }

  async updateAllMarginsInProjectArea({ projectAreaId, marginDecimal }: { projectAreaId: string, marginDecimal: number }) {
    try {
      // First, get all line item groups in the project area
      const groups = await prisma.lineItemGroup.findMany({
        where: {
          projectAreaId: projectAreaId
        },
        select: {
          id: true
        }
      });

      const groupIds = groups.map(group => group.id);

      if (groupIds.length === 0) {
        // No groups found, return empty result
        return { count: 0 };
      }

      // Update all line items in all groups of this project area
      const result = await prisma.lineItem.updateMany({
        where: {
          lineItemGroupId: {
            in: groupIds
          }
        },
        data: {
          marginDecimal: marginDecimal
        }
      });

      return result;
    } catch (error) {
      throw new Error(`Error updating margins for all line items in project area ${projectAreaId}: ${error}`);
    }
  }
}
