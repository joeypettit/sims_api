import { warn } from "console";
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
          groupCategory: {
            connect: { id: categoryId },
          },
          projectArea: {
            connect: { id: projectAreaId },
          },
        },
        select: {
          id: true,
          name: true,
          projectAreaId: true,
          groupCategoryId: true,
        },
      });

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
