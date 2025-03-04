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
exports.GroupsService = void 0;
const client_1 = require("@prisma/client");
const prisma_client_1 = __importDefault(require("../../prisma/prisma-client"));
const project_sort_1 = require("../utility/project-sort");
const query_objects_1 = require("../repository/query-objects");
const groupWithLineItem = client_1.Prisma.validator()({
    include: { lineItems: true }
});
class GroupsService {
    createGroup(_a) {
        return __awaiter(this, arguments, void 0, function* ({ groupName, categoryId, projectAreaId }) {
            let lastIndex = 0;
            try {
                const groupsInCategory = yield prisma_client_1.default.lineItemGroup.findMany({
                    where: {
                        groupCategoryId: categoryId,
                        projectAreaId: projectAreaId
                    },
                });
                lastIndex = groupsInCategory.reduce((acc, current) => {
                    if (acc > current.indexInCategory)
                        return acc;
                    return current.indexInCategory;
                }, 0);
            }
            catch (error) {
                console.error("Error finding last index of line items in group:", error);
            }
            try {
                const newGroup = yield prisma_client_1.default.lineItemGroup.create({
                    data: {
                        name: groupName,
                        indexInCategory: lastIndex + 1,
                        groupCategory: {
                            connect: { id: categoryId },
                        },
                        projectArea: {
                            connect: { id: projectAreaId },
                        },
                    },
                    select: {
                        id: true,
                        indexInCategory: true,
                        name: true,
                        projectAreaId: true,
                        groupCategoryId: true,
                    },
                });
                console.log("newGroup", newGroup);
                return newGroup;
            }
            catch (error) {
                console.error(`Error creating group on area with id: ${projectAreaId}`, error);
                throw Error(`Error creating group on area with id: ${projectAreaId}`);
            }
        });
    }
    updateIndexInCategory(_a) {
        return __awaiter(this, arguments, void 0, function* ({ groupId, indexInCategory }) {
            try {
                const group = yield prisma_client_1.default.lineItemGroup.update(Object.assign({ where: {
                        id: groupId,
                    }, data: {
                        indexInCategory: indexInCategory
                    } }, query_objects_1.lineItemGroupFullSelect));
                return group;
            }
            catch (error) {
                console.error(`Error updating index on group with id: ${groupId}`, error);
                throw Error(`Error updating index on group with id: ${groupId}`);
            }
        });
    }
    setIsOpenOnAllGroupsInArea(_a) {
        return __awaiter(this, arguments, void 0, function* ({ areaId, isOpen }) {
            try {
                const groups = yield prisma_client_1.default.lineItemGroup.updateMany({
                    where: {
                        projectAreaId: areaId
                    },
                    data: {
                        isOpen: isOpen
                    },
                });
                return groups;
            }
            catch (error) {
                console.error(`Error setting all groups isOpen on area with id: ${areaId}`, error);
                throw Error(`Error setting all groups isOpen on area with id: ${areaId}`);
            }
        });
    }
    setGroupIndexInCategory(_a) {
        return __awaiter(this, arguments, void 0, function* ({ groupId, categoryId, newIndex }) {
            try {
                const movedGroup = yield prisma_client_1.default.lineItemGroup.findFirst({
                    where: {
                        id: groupId
                    },
                });
                const groupsInCategory = yield prisma_client_1.default.lineItemGroup.findMany({
                    where: {
                        projectAreaId: movedGroup === null || movedGroup === void 0 ? void 0 : movedGroup.projectAreaId,
                        groupCategory: {
                            id: movedGroup === null || movedGroup === void 0 ? void 0 : movedGroup.groupCategoryId
                        }
                    }
                });
                if (!movedGroup || !groupsInCategory)
                    throw Error("Not groupId or correspoding groupsInCategory not found");
                const oldIndex = movedGroup.indexInCategory;
                if (oldIndex === newIndex) {
                    return movedGroup;
                }
                const lowerIndex = Math.min(oldIndex, newIndex);
                const higherIndex = Math.max(oldIndex, newIndex);
                const groupsToUpdate = [];
                groupsInCategory.map((group) => {
                    if (group.indexInCategory >= lowerIndex &&
                        group.indexInCategory <= higherIndex) {
                        if (group.id === groupId) {
                            groupsToUpdate.push({ id: group.id, updatedIndex: newIndex });
                            return Object.assign(Object.assign({}, group), { indexInCategory: newIndex });
                        }
                        const indexModifier = (oldIndex < newIndex ? -1 : 1);
                        groupsToUpdate.push({ id: group.id, updatedIndex: group.indexInCategory + indexModifier });
                        return Object.assign(Object.assign({}, group), { indexInCategory: group.indexInCategory + indexModifier });
                    }
                    return group;
                });
                let updatedGroup = undefined;
                groupsToUpdate.forEach((group) => __awaiter(this, void 0, void 0, function* () {
                    const result = yield prisma_client_1.default.lineItemGroup.update({
                        where: {
                            id: group.id
                        },
                        data: {
                            indexInCategory: group.updatedIndex
                        }
                    });
                    if (result.id === movedGroup.id) {
                        updatedGroup = result;
                    }
                }));
                return updatedGroup;
            }
            catch (error) {
                console.error(`Error setting group in index category: ${groupId}`, error);
                throw Error(`Error setting group in index category ${groupId}`);
            }
        });
    }
    ensureGroupLineItemsAreCorrectlyIndexed(_a) {
        return __awaiter(this, arguments, void 0, function* ({ group }) {
            const updatedLineItems = [];
            const updatedItemsIds = (0, project_sort_1.reindexEntitiesInArray)({ arr: group.lineItems, indexKeyName: "indexInGroup" });
            //
            //     groupsToUpdate.forEach(async (group) => {
            //       try {
            //         await groupService.updateIndexInCategory({ groupId: group.itemId, indexInCategory: group.updatedIndex })
            //       } catch (error) {
            //         console.error(
            //           `Error updating indexInCategory on group with id: ${group.itemId}:`,
            //           error
            //         );
            //         throw new Error(
            //           `Error updating indexInCategory on group: ${error}`
            //         );
            //       }
            //     })
            //
            //     for (const category in groupsGroupedByCategory) {
            //       updatedGroups.push(...groupsGroupedByCategory[category])
            //     }
            //     area.lineItemGroups = updatedGroups;
            //
            //     return area;
            //   }
            //
        });
    }
}
exports.GroupsService = GroupsService;
