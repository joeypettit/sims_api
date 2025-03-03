import type { LineItemGroup } from "./line-item-group";
import type { LineItem } from "./line-item";
import type { ProjectArea } from "./project-area";

export type AreaTemplate = {
  id: string;
  name: string;
  projectAreaId: string;
  projectArea: ProjectArea;
};
