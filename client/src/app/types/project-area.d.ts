import { LineItem } from "./line-item";
import { BudgetProposal } from "./budget-proposal";
import { PriceRange } from "./price-range";

export type ProjectArea = {
  id: string;
  name: string;
  projectId: string;
  totalSalePrice: PriceRange;
  lineItemGroups: LineItemGroup[];
};
