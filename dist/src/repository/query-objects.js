"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectAreaFullSelect = exports.lineItemGroupFullSelect = exports.lineItemFullSelect = exports.lineItemOptionFullSelect = exports.optionTierFullSelect = void 0;
exports.optionTierFullSelect = {
    select: {
        name: true,
        tierLevel: true,
    },
};
exports.lineItemOptionFullSelect = {
    include: {
        optionTier: exports.optionTierFullSelect
    }
};
exports.lineItemFullSelect = {
    include: {
        lineItemOptions: exports.lineItemOptionFullSelect,
        unit: {
            select: {
                id: true,
                name: true
            }
        }
    }
};
exports.lineItemGroupFullSelect = {
    include: {
        lineItems: exports.lineItemFullSelect,
    }
};
exports.projectAreaFullSelect = {
    include: {
        lineItemGroups: exports.lineItemGroupFullSelect
    }
};
