
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

}
