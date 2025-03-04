import type { ProjectArea } from "./project-area";

export interface AreaTemplate {
  id: string;
  name: string;
  projectAreaId: string;
  projectArea?: ProjectArea;
  createdAt: Date;
  updatedAt: Date;
}
