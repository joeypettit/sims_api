import { Prisma } from "@prisma/client";
import prisma from "../../prisma/prisma-client";

export type AreaTemplateWithProjectArea = Prisma.PromiseReturnType<TemplatesRepo["findById"]>

export default class TemplatesRepo {
  async findById({ templateId }: { templateId: string }) {
    try {
      const result = await prisma.areaTemplate.findUnique({
        where: {
          id: templateId,
        },
        include: {
          projectArea: {
            include: {
              lineItemGroups: {
                include: {
                  lineItems: {
                    include: {
                      lineItemOptions: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      return result;
    } catch (error) {
      throw Error(`Error getting template with id ${templateId}`);
    }
  }

  async create({ name, projectAreaId }: { name: string; projectAreaId: string }) {
    try {
      const result = await prisma.areaTemplate.create({
        data: {
          name,
          projectAreaId,
        },
      });
      return result;
    } catch (error) {
      throw Error(`Error creating template: ${error}`);
    }
  }

  async delete({ templateId }: { templateId: string }) {
    try {
      await prisma.areaTemplate.delete({
        where: {
          id: templateId,
        },
      });
    } catch (error) {
      throw Error(`Error deleting template with id ${templateId}`);
    }
  }
}