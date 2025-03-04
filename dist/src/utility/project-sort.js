"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reindexEntitiesInArray = reindexEntitiesInArray;
exports.sortArrayByIndexProperty = sortArrayByIndexProperty;
exports.groupByValue = groupByValue;
function reindexEntitiesInArray({ arr, indexKeyName }) {
    const sortedArray = sortArrayByIndexProperty({ arr, indexKeyName });
    const updatedItems = [];
    sortedArray.forEach((item, index) => {
        if (typeof item[indexKeyName] != 'number')
            throw Error("arr[indexKeyName] must be a number");
        if (item[indexKeyName] != index) {
            item[indexKeyName] = index;
            const updatedItem = { id: item["id"], updatedIndex: item[indexKeyName] };
            updatedItems.push(updatedItem);
        }
    });
    return [sortedArray, updatedItems];
}
function sortArrayByIndexProperty({ arr, indexKeyName }) {
    return arr.sort((a, b) => {
        if (a[indexKeyName] > b[indexKeyName])
            return 1;
        if (a[indexKeyName] < b[indexKeyName])
            return -1;
        return 0;
    });
}
function groupByValue(array, valueGetter) {
    return array.reduce((result, item) => {
        const groupKey = valueGetter(item); // Use the callback to determine the group key
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
    }, {});
}
