import { LineItemGroup, LineItemOption, Prisma, Project, ProjectArea } from "@prisma/client";
import { LineItemsService } from "./line-items-service";
import { GroupsService } from "./groups-service";
import { UpdatedItem } from "../utility/project-sort";
import { groupByValue, reindexEntitiesInArray } from "../utility/project-sort";
import prisma from "../../prisma/prisma-client";
import ProjectAreaRepo, { ProjectAreaWithGroups } from "../repository/project-area-repo";
import { PriceRange } from "../types/price-range";

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

type DuplicateAreaParams = {
  areaId: string;
  name: string;
  userId: string;
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

      // Sort groups by indexInCategory to preserve order
      const sortedGroups = [...templateArea.projectArea.lineItemGroups].sort((a, b) => {
        if (a.indexInCategory !== b.indexInCategory) {
          return a.indexInCategory - b.indexInCategory;
        }
        // Use ID as tiebreaker for groups with same index
        return a.id.localeCompare(b.id);
      });

      const newArea = await prisma.projectArea.create({
        data: {
          name,
          project: {
            connect: { id: projectId },
          },
          lineItemGroups: {
            create: sortedGroups.map((group) => {
              // Sort line items by indexInGroup to preserve order
              const sortedLineItems = [...group.lineItems].sort((a, b) => {
                if (a.indexInGroup !== b.indexInGroup) {
                  return a.indexInGroup - b.indexInGroup;
                }
                // Use ID as tiebreaker for items with same index
                return a.id.localeCompare(b.id);
              });

              return {
                name: group.name,
                indexInCategory: group.indexInCategory,
                groupCategory: {
                  connect: { id: group.groupCategoryId },
                },
                lineItems: {
                  create: sortedLineItems.map((item) => ({
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
              };
            }),
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

  async deleteArea({ areaId }: { areaId: string }) {
    try {
      // With onDelete: Cascade set up, deleting the project area will automatically
      // delete all associated LineItemGroups, which will delete all LineItems,
      // which will delete all LineItemOptions
      const deletedArea = await prisma.projectArea.delete({
        where: {
          id: areaId
        }
      });

      return deletedArea;
    } catch (error) {
      console.error("Error deleting project area:", error);
      throw new Error(`Error deleting project area: ${error}`);
    }
  }

  async calculateAreaCostRange(areaId: string): Promise<PriceRange> {
    try {
      // Get the project area with its line item groups and line items
      const area = await prisma.projectArea.findUnique({
        where: { id: areaId },
        include: {
          lineItemGroups: {
            include: {
              lineItems: {
                include: {
                  lineItemOptions: true
                }
              }
            }
          }
        }
      });

      if (!area) {
        throw new Error(`Project area with ID ${areaId} not found`);
      }

      // Initialize total price range
      const totalPriceRange: PriceRange = {
        lowPriceInDollars: 0,
        highPriceInDollars: 0
      };

      // Calculate total for each group
      for (const group of area.lineItemGroups) {
        for (const lineItem of group.lineItems) {
          // Find the selected option
          const selectedOption = lineItem.lineItemOptions.find(option => option.isSelected);
          if (!selectedOption) continue;

          // Calculate price based on option type (exact or range)
          if (selectedOption.exactCostInDollarsPerUnit !== null) {
            const totalPrice = this.calculateTotalPrice({
              costPerUnit: selectedOption.exactCostInDollarsPerUnit,
              quantity: lineItem.quantity,
              marginDecimal: lineItem.marginDecimal,
              priceAdjustmentMultiplier: selectedOption.priceAdjustmentMultiplier || 1
            });
            totalPriceRange.lowPriceInDollars += totalPrice;
            totalPriceRange.highPriceInDollars += totalPrice;
          } else if (selectedOption.lowCostInDollarsPerUnit && selectedOption.highCostInDollarsPerUnit) {
            const lowPrice = this.calculateTotalPrice({
              costPerUnit: selectedOption.lowCostInDollarsPerUnit,
              quantity: lineItem.quantity,
              marginDecimal: lineItem.marginDecimal,
              priceAdjustmentMultiplier: selectedOption.priceAdjustmentMultiplier || 1
            });
            const highPrice = this.calculateTotalPrice({
              costPerUnit: selectedOption.highCostInDollarsPerUnit,
              quantity: lineItem.quantity,
              marginDecimal: lineItem.marginDecimal,
              priceAdjustmentMultiplier: selectedOption.priceAdjustmentMultiplier || 1
            });
            totalPriceRange.lowPriceInDollars += lowPrice;
            totalPriceRange.highPriceInDollars += highPrice;
          }
        }
      }

      // Round to whole dollars
      totalPriceRange.lowPriceInDollars = Math.ceil(totalPriceRange.lowPriceInDollars);
      totalPriceRange.highPriceInDollars = Math.ceil(totalPriceRange.highPriceInDollars);

      return totalPriceRange;
    } catch (error) {
      console.error("Error calculating area cost range:", error);
      throw new Error(`Error calculating area cost range: ${error}`);
    }
  }

  private calculateTotalPrice({
    costPerUnit,
    quantity,
    marginDecimal,
    priceAdjustmentMultiplier
  }: {
    costPerUnit: number;
    quantity: number;
    marginDecimal: number;
    priceAdjustmentMultiplier: number;
  }): number {
    // Calculate sale price per unit using the margin formula
    const salePricePerUnit = (costPerUnit / (1 - marginDecimal)) * priceAdjustmentMultiplier;
    // Calculate total price
    return salePricePerUnit * quantity;
  }

  async duplicate({ areaId, name }: { areaId: string; name: string }) {
    try {
      // Get the original area with project data for duplicate
      const originalArea = await prisma.projectArea.findUnique({
        where: { id: areaId },
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
          project: {
            include: {
              users: true,
              clients: true,
              stars: true
            }
          }
        }
      });

      if (!originalArea) {
        throw new Error(`Project area with ID ${areaId} not found`);
      }

      // Build the duplicate data structure
      const duplicateData = this.buildDuplicateData(originalArea, name);

      // Create the duplicated area using Prisma directly
      const duplicatedArea = await prisma.projectArea.create({
        data: duplicateData,
        select: {
          id: true
        }
      });

      return { id: duplicatedArea.id };
    } catch (error) {
      console.error(`Error duplicating project area ${areaId}:`, error);
      throw error;
    }
  }

  buildDuplicateData(originalArea: any, name: string, isTemplate: boolean = false) {
    const baseData = {
      name,
      lineItemGroups: {
        create: originalArea.lineItemGroups.map((group: any) => 
          groupService.buildDuplicateData(group)
        ),
      },
    };

    // Only add project connection if it's not a template
    if (!isTemplate) {
      return {
        ...baseData,
        project: {
          connect: { id: originalArea.project.id },
        },
      };
    }

    return baseData;
  }

}
