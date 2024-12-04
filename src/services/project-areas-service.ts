import { LineItemGroup, LineItemOption, ProjectArea } from "@prisma/client";
import { GroupsService } from "./groups-service";
import { UpdatedItem } from "../utility/project-sort";
import { groupByValue, reindexEntitiesInArray } from "../utility/project-sort";
import { removeKeysWhereUndefined } from "../util";
import prisma from "../../prisma/prisma-client";
import { ProjectAreaWithGroups } from "../../prisma/extended-types/project-area-types";

const groupService = new GroupsService()

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
      const area = await this.ensureAreaGroupsAreCorrectlyIndexed(result)
      console.log("area is", area)

      return area;
    }
    catch (error) {
      throw Error(`Error getting area with id ${areaId}`)
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
    console.log("groups in category", groupsGroupedByCategory)
    const categoryGroups = Object.keys(groupsGroupedByCategory)
    const groupsToUpdate: UpdatedItem[] = []
    const updatedGroups: LineItemGroup[] = []

    categoryGroups.forEach((key) => {
      const groupsInCat = groupsGroupedByCategory[key]
      const updatedItems = reindexEntitiesInArray({ arr: groupsInCat, indexKeyName: "indexInCategory" }).updatedItemIds;
      groupsToUpdate.push(...updatedItems)
    })

    groupsToUpdate.forEach(async (group) => {
      try {
        await groupService.updateIndexInCategory({ groupId: group.itemId, indexInCategory: group.updatedIndex })
      } catch (error) {
        console.error(
          `Error updating indexInCategory on group with id: ${group.itemId}:`,
          error
        );
        throw new Error(
          `Error updating indexInCategory on group: ${error}`
        );
      }
    })

    for (const category in groupsGroupedByCategory) {
      updatedGroups.push(...groupsGroupedByCategory[category])
    }
    area.lineItemGroups = updatedGroups;

    return area;
  }
}
