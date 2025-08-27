import { LineItem, LineItemGroup, Prisma } from "@prisma/client";
import prisma from "../../prisma/prisma-client";
import { reindexEntitiesInArray, UpdatedItem } from "../utility/project-sort";
import LineItemGroupsRepo from "../repository/groups-repo";
import { lineItemGroupFullSelect } from "../repository/query-objects";

const groupWithLineItem = Prisma.validator<Prisma.LineItemGroupDefaultArgs>()({
  include: { lineItems: true }
})

type GroupWithLineItems = Prisma.LineItemGroupGetPayload<typeof groupWithLineItem>

type SetIsOpenOnAllGroupsInAreaParams = {
  isOpen: boolean;
  areaId: string;
};

type createGroupParams = {
  groupName: string;
  categoryId: string;
  projectAreaId: string;
};

type SetGroupIndexInCategoryParams = {
  groupId: string;
  categoryId: string;
  newIndex: number;
}

type updateIndexInCategoryParams = {
  groupId: string,
  indexInCategory: number
}

type UpdateGroupNameParams = {
  groupId: string;
  name: string;
};

type DeleteGroupParams = {
  groupId: string;
};

const groupsRepo = new LineItemGroupsRepo();

export class GroupsService {

  async createGroup({ groupName, categoryId, projectAreaId }: createGroupParams) {
    let lastIndex = 0;
    try {
      const groupsInCategory = await prisma.lineItemGroup.findMany({
        where: {
          groupCategoryId: categoryId,
          projectAreaId: projectAreaId
        },
      });
      lastIndex = groupsInCategory.reduce((acc, current) => {
        if (acc > current.indexInCategory) return acc;
        return current.indexInCategory;
      }, 0)
    } catch (error) {
      console.error("Error finding last index of line items in group:", error);
    }

    try {
      const newGroup = await prisma.lineItemGroup.create({
        data: {
          name: groupName,
          indexInCategory: lastIndex + 1,
          groupCategory: {
            connect: { id: categoryId },
          },
          projectArea: {
            connect: { id: projectAreaId },
          },
        },
        select: {
          id: true,
          indexInCategory: true,
          name: true,
          projectAreaId: true,
          groupCategoryId: true,
        },
      });
      console.log("newGroup", newGroup)
      return newGroup
    } catch (error) {
      console.error(
        `Error creating group on area with id: ${projectAreaId}`,
        error
      );
      throw Error(
        `Error creating group on area with id: ${projectAreaId}`,
      );
    }
  }

  async updateIndexInCategory({ groupId, indexInCategory }: updateIndexInCategoryParams) {
    try {
      const group = await prisma.lineItemGroup.update({
        where: {
          id: groupId,
        },
        data: {
          indexInCategory: indexInCategory
        },
        ...lineItemGroupFullSelect
      })
      return group;
    } catch (error) {
      console.error(
        `Error updating index on group with id: ${groupId}`,
        error
      );
      throw Error(
        `Error updating index on group with id: ${groupId}`,
      );
    }
  }

  async setIsOpenOnAllGroupsInArea({ areaId, isOpen }: SetIsOpenOnAllGroupsInAreaParams) {
    try {
      const groups = await prisma.lineItemGroup.updateMany({
        where: {
          projectAreaId: areaId
        },
        data: {
          isOpen: isOpen
        },
      });
      return groups;
    } catch (error) {
      console.error(
        `Error setting all groups isOpen on area with id: ${areaId}`,
        error
      );
      throw Error(
        `Error setting all groups isOpen on area with id: ${areaId}`,
      );
    }
  }

  async setGroupIndexInCategory({ groupId, categoryId, newIndex }: SetGroupIndexInCategoryParams) {
    try {
      const movedGroup = await prisma.lineItemGroup.findFirst({
        where: {
          id: groupId
        },
      })
      const groupsInCategory = await prisma.lineItemGroup.findMany({
        where: {
          projectAreaId: movedGroup?.projectAreaId,
          groupCategory: {
            id: movedGroup?.groupCategoryId
          }
        }
      })

      if (!movedGroup || !groupsInCategory) throw Error("Not groupId or correspoding groupsInCategory not found")
      const oldIndex = movedGroup.indexInCategory;
      if (oldIndex === newIndex) {
        return movedGroup
      }

      const lowerIndex = Math.min(oldIndex, newIndex)
      const higherIndex = Math.max(oldIndex, newIndex)
      const groupsToUpdate: { id: string, updatedIndex: number }[] = []
      groupsInCategory.map((group) => {
        if (group.indexInCategory >= lowerIndex &&
          group.indexInCategory <= higherIndex) {
          if (group.id === groupId) {
            groupsToUpdate.push({ id: group.id, updatedIndex: newIndex })
            return { ...group, indexInCategory: newIndex }
          }
          const indexModifier = (oldIndex < newIndex ? -1 : 1)
          groupsToUpdate.push({ id: group.id, updatedIndex: group.indexInCategory + indexModifier })

          return {
            ...group,
            indexInCategory: group.indexInCategory + indexModifier,
          };
        }
        return group;
      });

      let updatedGroup: LineItemGroup | undefined = undefined;
      groupsToUpdate.forEach(async (group) => {
        const result = await prisma.lineItemGroup.update({
          where: {
            id: group.id
          },
          data: {
            indexInCategory: group.updatedIndex
          }
        })
        if (result.id === movedGroup.id) {
          updatedGroup = result;
        }
      })



      return updatedGroup;
    } catch (error) {
      console.error(
        `Error setting group in index category: ${groupId}`,
        error
      );
      throw Error(
        `Error setting group in index category ${groupId}`,
      );
    }
  }

  async ensureGroupLineItemsAreCorrectlyIndexed({ group }: { group: GroupWithLineItems }) {

    const updatedLineItems: LineItem[] = []


    const updatedItemsIds = reindexEntitiesInArray({ arr: group.lineItems, indexKeyName: "indexInGroup" })

    //
    //     groupsToUpdate.forEach(async (group) => {
    //       try {
    //         await groupService.updateIndexInCategory({ groupId: group.itemId, indexInCategory: group.updatedIndex })
    //       } catch (error) {
    //         console.error(
    //           `Error updating indexInCategory on group with id: ${group.itemId}:`,
    //           error
    //         );
    //         throw new Error(
    //           `Error updating indexInCategory on group: ${error}`
    //         );
    //       }
    //     })
    //
    //     for (const category in groupsGroupedByCategory) {
    //       updatedGroups.push(...groupsGroupedByCategory[category])
    //     }
    //     area.lineItemGroups = updatedGroups;
    //
    //     return area;
    //   }
    //
  }

  async updateGroupName({ groupId, name }: UpdateGroupNameParams) {
    try {
      const group = await groupsRepo.updateName({ groupId, name });
      return group;
    } catch (error) {
      console.error("Error updating group name", error);
      throw error;
    }
  }

  async deleteGroup({ groupId }: DeleteGroupParams) {
    try {
      await groupsRepo.delete({ groupId });
    } catch (error) {
      console.error("Error deleting group", error);
      throw error;
    }
  }
}
