import { LineItemOption } from "@prisma/client";
import { removeKeysWhereUndefined } from "../util";
import prisma from "../../prisma/prisma-client";

type CreateBlankParams = {
  name: string;
  projectId: string;
};

export class ProjectAreaService {
  async createBlank({ projectId, name }: CreateBlankParams) {
    try {
      const newArea = await prisma.projectArea.create({
        data: {
          name: name,
          project: {
            connect: { id: projectId },
          },
        },
      });
      return newArea;
    } catch (error) {
      console.error(
        `Error creating new project area on project: ${projectId}, with name ${name}:`,
        error
      );
      throw Error(
        `Error creating new project area on project: ${projectId}, with name ${name}: ${error}`
      );
    }
  }
}
