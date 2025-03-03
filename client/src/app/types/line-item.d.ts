import { ProductOption } from "./line-item-option";
import { LineItemGroup } from "./line-item-group";
import { LineItemUnit } from "./line-item-unit";

export type LineItem = {
  id: string;
  name: string;
  quantity: number;
  unit: LineItemUnit;
  unitId: string;
  marginDecimal: number | undefined;
  indexInGroup: number;
  lineItemGroup: LineItemGroup;
  lineItemGroupId: string;
  lineItemOptions: LineItemOption[];
  projectId: string;
  projectAreaId: string;
};
