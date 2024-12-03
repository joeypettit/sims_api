import { LineItemGroup } from "@prisma/client";
import prisma from "../../prisma/prisma-client";

type SetIsOpenOnAllGroupsInAreaParams = {
  isOpen: boolean;
  areaId: string;
};

type createGroupParams = {
  groupName: string;
  categoryId: string;
  projectAreaId: string;
};

type normalizeGroupIndexesInCategoryParams = {
  groups: LineItemGroup[]
}

type updateIndexInCategoryParams = {
  groupId: string,
  indexInCategory: number
}

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
        }
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
}
