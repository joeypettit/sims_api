
import { Prisma } from "@prisma/client";
import prisma from "../../prisma/prisma-client";
import ProjectAreaRepo from "./project-area-repo";
import { lineItemGroupFullSelect } from "./query-objects";

export type LineItemGroupWithLineItems = Prisma.PromiseReturnType<LineItemGroupsRepo["findById"]>

export default class LineItemGroupsRepo {

  async findById({ groupId }: { groupId: string }) {
    try {
      const result = await prisma.lineItemGroup.findUnique({
        where: {
          id: groupId,
        },
        ...lineItemGroupFullSelect
      });
      return result;
    }
    catch (error) {
      throw Error(`Error finding group with id ${groupId}`)
    }
  }

  async updateName({ groupId, name }: { groupId: string; name: string }) {
    try {
      const result = await prisma.lineItemGroup.update({
        where: {
          id: groupId,
        },
        data: {
          name: name,
        },
        ...lineItemGroupFullSelect
      });
      return result;
    } catch (error) {
      throw Error(`Error updating group name with id ${groupId}`)
    }
  }

  async delete({ groupId }: { groupId: string }) {
    try {
      await prisma.lineItemGroup.delete({
        where: {
          id: groupId,
        },
      });
    } catch (error) {
      throw Error(`Error deleting group with id ${groupId}`)
    }
  }
}
