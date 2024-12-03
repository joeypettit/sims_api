import type { ProjectArea } from "@prisma/client";

type ReindexEntitiesInListReturnType<T> = {
  sortedList: T[],
  updatedItemIds: UpdatedItem[]
}


type UpdatedItem = {
  itemId: string,
  updatedIndex: number
}



export function reindexEntitiesInArray<T extends Record<string, any>>({ arr, indexKeyName }: { arr: T[], indexKeyName: keyof T }): ReindexEntitiesInListReturnType<T> {
  const sortedList = sortArrayByIndexProperty({ arr, indexKeyName })
  const updatedItemIds: UpdatedItem[] = [];
  sortedList.forEach((item, index) => {
    if (typeof item[indexKeyName] != 'number') throw Error("arr[indexKeyName] must be a number")
    if (item[indexKeyName] != index) {
      (item[indexKeyName] as number) = index;
      const updatedItem: UpdatedItem = { itemId: item["id"], updatedIndex: item[indexKeyName] }
      updatedItemIds.push(updatedItem)
    }
  });
  return { sortedList, updatedItemIds }
}

export function sortArrayByIndexProperty<T>({ arr, indexKeyName }: { arr: T[], indexKeyName: keyof T }) {
  return arr.sort((a, b) => {
    if (a[indexKeyName] > b[indexKeyName]) return 1;
    if (a[indexKeyName] < b[indexKeyName]) return -1;
    return 0;
  })
}

export function groupByValue<T>(
  array: T[],
  valueGetter: (item: T) => string | number
): Record<string | number, T[]> {
  return array.reduce((result, item) => {
    const groupKey = valueGetter(item); // Use the callback to determine the group key
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string | number, T[]>);
}
