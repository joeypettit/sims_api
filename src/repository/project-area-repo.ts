import { Prisma } from "@prisma/client";
import { projectAreaFullSelect, } from "./query-objects";
import prisma from "../../prisma/prisma-client";

export type ProjectAreaWithGroups = Prisma.PromiseReturnType<ProjectAreasRepo["findById"]>

export default class ProjectAreasRepo {

  async findById({ areaId }: { areaId: string }) {
    try {
      const result = await prisma.projectArea.findUnique({
        where: {
          id: areaId,
        },
        ...projectAreaFullSelect
      });
      return result;
    }
    catch (error) {
      throw Error(`Error getting area with id ${areaId}`)
    }
  }

}
