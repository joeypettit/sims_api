import { Project } from "./project";

export type SearchProjectsResponse = {
  projects: Project[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
  };
}; 