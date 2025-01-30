import { LineItemGroup, LineItemOption, Prisma, Project, ProjectArea } from "@prisma/client";
import { LineItemsService } from "./line-items-service";
import { GroupsService } from "./groups-service";
import { UpdatedItem } from "../utility/project-sort";
import { groupByValue, reindexEntitiesInArray } from "../utility/project-sort";
import prisma from "../../prisma/prisma-client";
import ProjectAreaRepo, { ProjectAreaWithGroups } from "../repository/project-area-repo";

const lineItemService = new LineItemsService()
const groupService = new GroupsService()
const projectAreaRepo = new ProjectAreaRepo()

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

  async getById({ areaId }: { areaId: string }) {

    let area: ProjectAreaWithGroups = await projectAreaRepo.findById({ areaId })
    area = await this.ensureGroupsAreCorrectlyIndexed(area)
    area = await this.ensureLineItemsAreCorrectlyIndexed(area)
    return area;
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

  async ensureGroupsAreCorrectlyIndexed(area: ProjectAreaWithGroups) {
    if (!area) throw Error("Error: Area is null or undefined");

    // Group groups by category
    const groupsGroupedByCategory = groupByValue(
      area.lineItemGroups,
      (item: LineItemGroup) => item.groupCategoryId
    );

    const categoryGroups = Object.keys(groupsGroupedByCategory);

    // Collect all groups that need updates
    const groupsToUpdate: UpdatedItem[] = [];

    categoryGroups.forEach((key) => {
      const groupsInCat = groupsGroupedByCategory[key];
      const [ignored, updatedItems] = reindexEntitiesInArray({
        arr: groupsInCat,
        indexKeyName: "indexInCategory",
      });
      groupsToUpdate.push(...updatedItems);
    });

    // Update groups and build the new line item groups array
    const newLineItemGroups = await Promise.all(
      area.lineItemGroups.map(async (group) => {
        const groupToUpdate = groupsToUpdate.find(
          (update) => update.id === group.id
        );

        if (groupToUpdate) {
          try {
            return await groupService.updateIndexInCategory({
              groupId: groupToUpdate.id,
              indexInCategory: groupToUpdate.updatedIndex,
            });
          } catch (error) {
            console.error(`Error updating indexInCategory on group with id: ${groupToUpdate.id}:`, error); throw new Error(`Error updating indexInCategory on group: ${error}`);
          }
        }

        // If the group doesn't need an update, return it as-is
        return group;
      })
    );

    // Return the new area object with updated groups
    const newArea = {
      ...area,
      lineItemGroups: newLineItemGroups,
    };

    return newArea;
  }

  async ensureLineItemsAreCorrectlyIndexed(area: ProjectAreaWithGroups) {
    if (!area) throw Error("Error: Area is null or undefined");

    const lineItemsToUpdate: UpdatedItem[] = [];
    const updatedGroups = area.lineItemGroups.map((group) => {
      const [updatedLineItemArray, itemsToUpdate] = reindexEntitiesInArray({
        arr: group.lineItems,
        indexKeyName: "indexInGroup"
      })
      console.log("testing here", updatedLineItemArray)
      lineItemsToUpdate.push(...itemsToUpdate)
      return { ...group, updatedLineItemArray }
    })

    await Promise.all(
      lineItemsToUpdate.map(async (updatedItem) => {
        console.log("updatedItem:", updatedItem);
        try {
          return await lineItemService.updateIndexInGroup({
            lineItemId: updatedItem.id,
            indexInGroup: updatedItem.updatedIndex,
          });
        } catch (error) {
          console.error(
            `Error updating indexInGroup on line item with id: ${updatedItem.id}:`,
            error
          );
          throw new Error(`Error updating indexInGroup on line item: ${error}`);
        }
      })
    );
    
    // Return the new area object with updated groups
    const newArea: ProjectAreaWithGroups = {
      ...area,
      lineItemGroups: updatedGroups,
    };
    

    return newArea;
  }

}
