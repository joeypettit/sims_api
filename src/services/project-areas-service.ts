import { LineItemOption } from "@prisma/client";
import { removeKeysWhereUndefined } from "../util";
import prisma from "../../prisma/prisma-client";

type CreateBlankParams = {
  name: string;
  projectId: string;
};

type CreateFromTemplateParams = {
  name: string;
  projectId: string;
  templateId: string;
};

export class ProjectAreasService {
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
  async createFromTemplate({
    projectId,
    name,
    templateId,
  }: CreateFromTemplateParams) {
    try {
      // Step 1: Find the template project area with its line item groups and line items
      const templateArea = await prisma.areaTemplate.findUnique({
        where: { id: templateId },
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

      if (!templateArea) {
        throw new Error(`Template with ID ${templateId} not found`);
      }

      const newArea = await prisma.projectArea.create({
        data: {
          name,
          project: {
            connect: { id: projectId },
          },
          lineItemGroups: {
            create: templateArea.projectArea.lineItemGroups.map((group) => ({
              name: group.name,
              groupCategory: {
                connect: { id: group.groupCategoryId },
              },
              lineItems: {
                create: group.lineItems.map((item) => ({
                  name: item.name,
                  quantity: item.quantity,
                  unitId: item.unitId,
                  marginDecimal: item.marginDecimal,
                  indexInGroup: item.indexInGroup,
                  lineItemOptions: {
                    create: item.lineItemOptions.map((option) => ({
                      description: option.description,
                      lowCostInDollarsPerUnit: option.lowCostInDollarsPerUnit,
                      highCostInDollarsPerUnit: option.highCostInDollarsPerUnit,
                      exactCostInDollarsPerUnit:
                        option.exactCostInDollarsPerUnit,
                      priceAdjustmentMultiplier:
                        option.priceAdjustmentMultiplier,
                      isSelected: option.isSelected,
                      optionTierId: option.optionTierId,
                    })),
                  },
                })),
              },
            })),
          },
        },
      });

      return newArea;
    } catch (error) {
      console.error(
        `Error creating new project area from template with ID ${templateId}:`,
        error
      );
      throw new Error(
        `Error creating new project area from template: ${error}`
      );
    }
  }
}
