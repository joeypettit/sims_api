import prisma from "../../prisma/prisma-client";

type SetIsOpenOnAllGroupsInAreaParams = {
  isOpen: boolean;
  areaId: string;
};


export class GroupsService {
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
