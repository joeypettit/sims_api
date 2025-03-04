"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectAreasService = void 0;
const line_items_service_1 = require("./line-items-service");
const groups_service_1 = require("./groups-service");
const project_sort_1 = require("../utility/project-sort");
const prisma_client_1 = __importDefault(require("../../prisma/prisma-client"));
const project_area_repo_1 = __importDefault(require("../repository/project-area-repo"));
const lineItemService = new line_items_service_1.LineItemsService();
const groupService = new groups_service_1.GroupsService();
const projectAreaRepo = new project_area_repo_1.default();
class ProjectAreasService {
    getById(_a) {
        return __awaiter(this, arguments, void 0, function* ({ areaId }) {
            let area = yield projectAreaRepo.findById({ areaId });
            area = yield this.ensureGroupsAreCorrectlyIndexed(area);
            area = yield this.ensureLineItemsAreCorrectlyIndexed(area);
            return area;
        });
    }
    createBlank(_a) {
        return __awaiter(this, arguments, void 0, function* ({ projectId, name }) {
            try {
                const newArea = yield prisma_client_1.default.projectArea.create({
                    data: {
                        name: name,
                        project: {
                            connect: { id: projectId },
                        },
                    },
                });
                return newArea;
            }
            catch (error) {
                console.error(`Error creating new project area on project: ${projectId}, with name ${name}:`, error);
                throw Error(`Error creating new project area on project: ${projectId}, with name ${name}: ${error}`);
            }
        });
    }
    createFromTemplate(_a) {
        return __awaiter(this, arguments, void 0, function* ({ projectId, name, templateId, }) {
            try {
                // Step 1: Find the template project area with its line item groups and line items
                const templateArea = yield prisma_client_1.default.areaTemplate.findUnique({
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
                const newArea = yield prisma_client_1.default.projectArea.create({
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
                                                exactCostInDollarsPerUnit: option.exactCostInDollarsPerUnit,
                                                priceAdjustmentMultiplier: option.priceAdjustmentMultiplier,
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
            }
            catch (error) {
                console.error(`Error creating new project area from template with ID ${templateId}:`, error);
                throw new Error(`Error creating new project area from template: ${error}`);
            }
        });
    }
    ensureGroupsAreCorrectlyIndexed(area) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!area)
                throw Error("Error: Area is null or undefined");
            // Group groups by category
            const groupsGroupedByCategory = (0, project_sort_1.groupByValue)(area.lineItemGroups, (item) => item.groupCategoryId);
            const categoryGroups = Object.keys(groupsGroupedByCategory);
            // Collect all groups that need updates
            const groupsToUpdate = [];
            categoryGroups.forEach((key) => {
                const groupsInCat = groupsGroupedByCategory[key];
                const [ignored, updatedItems] = (0, project_sort_1.reindexEntitiesInArray)({
                    arr: groupsInCat,
                    indexKeyName: "indexInCategory",
                });
                groupsToUpdate.push(...updatedItems);
            });
            // Update groups and build the new line item groups array
            const newLineItemGroups = yield Promise.all(area.lineItemGroups.map((group) => __awaiter(this, void 0, void 0, function* () {
                const groupToUpdate = groupsToUpdate.find((update) => update.id === group.id);
                if (groupToUpdate) {
                    try {
                        return yield groupService.updateIndexInCategory({
                            groupId: groupToUpdate.id,
                            indexInCategory: groupToUpdate.updatedIndex,
                        });
                    }
                    catch (error) {
                        console.error(`Error updating indexInCategory on group with id: ${groupToUpdate.id}:`, error);
                        throw new Error(`Error updating indexInCategory on group: ${error}`);
                    }
                }
                // If the group doesn't need an update, return it as-is
                return group;
            })));
            // Return the new area object with updated groups
            const newArea = Object.assign(Object.assign({}, area), { lineItemGroups: newLineItemGroups });
            return newArea;
        });
    }
    ensureLineItemsAreCorrectlyIndexed(area) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!area)
                throw Error("Error: Area is null or undefined");
            const lineItemsToUpdate = [];
            const updatedGroups = area.lineItemGroups.map((group) => {
                const [updatedLineItemArray, itemsToUpdate] = (0, project_sort_1.reindexEntitiesInArray)({
                    arr: group.lineItems,
                    indexKeyName: "indexInGroup"
                });
                console.log("testing here", updatedLineItemArray);
                lineItemsToUpdate.push(...itemsToUpdate);
                return Object.assign(Object.assign({}, group), { updatedLineItemArray });
            });
            yield Promise.all(lineItemsToUpdate.map((updatedItem) => __awaiter(this, void 0, void 0, function* () {
                console.log("updatedItem:", updatedItem);
                try {
                    return yield lineItemService.updateIndexInGroup({
                        lineItemId: updatedItem.id,
                        indexInGroup: updatedItem.updatedIndex,
                    });
                }
                catch (error) {
                    console.error(`Error updating indexInGroup on line item with id: ${updatedItem.id}:`, error);
                    throw new Error(`Error updating indexInGroup on line item: ${error}`);
                }
            })));
            // Return the new area object with updated groups
            const newArea = Object.assign(Object.assign({}, area), { lineItemGroups: updatedGroups });
            return newArea;
        });
    }
    deleteArea(_a) {
        return __awaiter(this, arguments, void 0, function* ({ areaId }) {
            try {
                // With onDelete: Cascade set up, deleting the project area will automatically
                // delete all associated LineItemGroups, which will delete all LineItems,
                // which will delete all LineItemOptions
                const deletedArea = yield prisma_client_1.default.projectArea.delete({
                    where: {
                        id: areaId
                    }
                });
                return deletedArea;
            }
            catch (error) {
                console.error("Error deleting project area:", error);
                throw new Error(`Error deleting project area: ${error}`);
            }
        });
    }
    calculateAreaCostRange(areaId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get the project area with its line item groups and line items
                const area = yield prisma_client_1.default.projectArea.findUnique({
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
                const totalPriceRange = {
                    lowPriceInDollars: 0,
                    highPriceInDollars: 0
                };
                // Calculate total for each group
                for (const group of area.lineItemGroups) {
                    for (const lineItem of group.lineItems) {
                        // Find the selected option
                        const selectedOption = lineItem.lineItemOptions.find(option => option.isSelected);
                        if (!selectedOption)
                            continue;
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
                        }
                        else if (selectedOption.lowCostInDollarsPerUnit && selectedOption.highCostInDollarsPerUnit) {
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
            }
            catch (error) {
                console.error("Error calculating area cost range:", error);
                throw new Error(`Error calculating area cost range: ${error}`);
            }
        });
    }
    calculateTotalPrice({ costPerUnit, quantity, marginDecimal, priceAdjustmentMultiplier }) {
        // Calculate sale price per unit using the margin formula
        const salePricePerUnit = (costPerUnit / (1 - marginDecimal)) * priceAdjustmentMultiplier;
        // Calculate total price
        return salePricePerUnit * quantity;
    }
}
exports.ProjectAreasService = ProjectAreasService;
