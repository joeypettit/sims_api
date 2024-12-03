import { LineItemGroup, LineItemOption, ProjectArea } from "@prisma/client";
import { groupByValue, reindexEntitiesInArray } from "../utility/project-sort";
import { removeKeysWhereUndefined } from "../util";
import prisma from "../../prisma/prisma-client";
import { ProjectAreaWithGroups } from "../../prisma/extended-types/project-area-types";

type GetByIdParams = {
  areaId: string;
}
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

  async getById({ areaId }: GetByIdParams) {

    try {
      const result = await prisma.projectArea.findUnique({
        where: {
          id: areaId,
        },
        select: {
          id: true,
          name: true,
          lineItemGroups: {
            select: {
              id: true,
              name: true,
              indexInCategory: true,
              groupCategoryId: true,
              groupCategory: true,
              lineItems: {
                select: {
                  id: true,
                  marginDecimal: true,
                  quantity: true,
                  name: true,
                  unit: true,
                  lineItemGroup: {
                    select: {
                      groupCategory: true,
                    },
                  },
                  lineItemOptions: {
                    select: {
                      id: true,
                      description: true,
                      exactCostInDollarsPerUnit: true,
                      lowCostInDollarsPerUnit: true,
                      highCostInDollarsPerUnit: true,
                      isSelected: true,
                      priceAdjustmentMultiplier: true,
                      optionTier: {
                        select: {
                          name: true,
                          tierLevel: true,
                        },
                      },
                    },
                    orderBy: {
                      optionTier: {
                        tierLevel: "asc",
                      },
                    },
                  },
                },
                orderBy: {
                  indexInGroup: "asc",
                },
              },
            },
          },
        },
      });
      //
      //ensure the groups are indexed correctly  
      this.ensureAreaGroupsAreCorrectlyIndexed(result)
      return result;
    }
    catch (error) {
      throw Error("Error creating")
    }
  }

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

  async ensureAreaGroupsAreCorrectlyIndexed(area: ProjectAreaWithGroups) {
    const groupsGroupedByCategory = groupByValue(area.lineItemGroups, (item: LineItemGroup) => item.groupCategoryId)
    const keys = Object.keys(groupsGroupedByCategory)
    const groupsToUpdateIds: string[] = []

    keys.forEach((key) => {
      const groupsInCat = groupsGroupedByCategory[key]
      const updatedIds = reindexEntitiesInArray({ arr: groupsInCat, indexKeyName: "indexInCategory" }).updatedItemIds;
      groupsToUpdateIds.push(...updatedIds)
    })

    groupsToUpdateIds.forEach((id) => {
      console.log("id is", id)
    })

    return groupsGroupedByCategory;
  }
}
