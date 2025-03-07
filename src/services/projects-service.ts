import ProjectsRepo from "../repository/projects-repo";
import { PriceRange } from "../types/price-range";
import prisma from "../../prisma/prisma-client";
import { ProjectAreasService } from "./project-areas-service";

const projectsRepo = new ProjectsRepo();
const projectAreasService = new ProjectAreasService();

export class ProjectsService {
  async search({ 
    query = "", 
    page = "1", 
    limit = "10" 
  }: { 
    query?: string, 
    page?: string, 
    limit?: string 
  }) {
    try {
      const skip = (Number(page) - 1) * Number(limit);
      const { projects, total } = await projectsRepo.search({
        query,
        skip,
        limit: Number(limit)
      });

      return {
        projects,
        pagination: {
          total,
          pages: Math.ceil(total / Number(limit)),
          currentPage: Number(page)
        }
      };
    } catch (error) {
      throw new Error(`Error searching projects: ${error}`);
    }
  }

  async calculateProjectCostRange(projectId: string): Promise<PriceRange> {
    try {
      // Get all project areas
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          areas: true
        }
      });

      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }

      // Initialize total price range
      const totalPriceRange: PriceRange = {
        lowPriceInDollars: 0,
        highPriceInDollars: 0
      };

      // Calculate total by summing up each area's cost range
      for (const area of project.areas) {
        const areaCostRange = await projectAreasService.calculateAreaCostRange(area.id);
        totalPriceRange.lowPriceInDollars += areaCostRange.lowPriceInDollars;
        totalPriceRange.highPriceInDollars += areaCostRange.highPriceInDollars;
      }

      // Round to whole dollars
      totalPriceRange.lowPriceInDollars = Math.ceil(totalPriceRange.lowPriceInDollars);
      totalPriceRange.highPriceInDollars = Math.ceil(totalPriceRange.highPriceInDollars);

      return totalPriceRange;
    } catch (error) {
      console.error("Error calculating project cost range:", error);
      throw new Error(`Error calculating project cost range: ${error}`);
    }
  }

  private calculateTotalPrice({
    costPerUnit,
    quantity,
    marginDecimal,
    priceAdjustmentMultiplier
  }: {
    costPerUnit: number;
    quantity: number;
    marginDecimal: number;
    priceAdjustmentMultiplier: number;
  }): number {
    // Calculate sale price per unit using the margin formula
    const salePricePerUnit = (costPerUnit / (1 - marginDecimal)) * priceAdjustmentMultiplier;
    // Calculate total price
    return salePricePerUnit * quantity;
  }

  async starProject(userId: string, projectId: string) {
    try {
      return await projectsRepo.starProject(userId, projectId);
    } catch (error) {
      throw new Error(`Error starring project: ${error}`);
    }
  }

  async unstarProject(userId: string, projectId: string) {
    try {
      return await projectsRepo.unstarProject(userId, projectId);
    } catch (error) {
      throw new Error(`Error unstarring project: ${error}`);
    }
  }

  async isProjectStarred(userId: string, projectId: string) {
    try {
      return await projectsRepo.isProjectStarred(userId, projectId);
    } catch (error) {
      throw new Error(`Error checking project star status: ${error}`);
    }
  }

  async getStarredProjects(userId: string) {
    try {
      return await projectsRepo.getStarredProjects(userId);
    } catch (error) {
      throw new Error(`Error getting starred projects: ${error}`);
    }
  }

  async searchProjects({ query, skip, limit, userId }: { query: string, skip: number, limit: number, userId: string }) {
    try {
      const { projects, total } = await projectsRepo.search({ query, skip, limit });
      
      // Transform projects to include isStarred boolean
      const transformedProjects = projects.map(project => ({
        ...project,
        isStarred: project.stars.some(star => star.userId === userId)
      }));

      return { 
        projects: transformedProjects,
        total 
      };
    } catch (error) {
      throw new Error(`Error searching projects: ${error}`);
    }
  }

  async searchMyProjects({ query, skip, limit, userId }: { query: string, skip: number, limit: number, userId: string }) {
    try {
      const { projects, total } = await projectsRepo.searchMyProjects({ query, skip, limit, userId });
      
      // Transform projects to include isStarred boolean
      const transformedProjects = projects.map(project => ({
        ...project,
        isStarred: project.stars.some(star => star.userId === userId)
      }));

      return { 
        projects: transformedProjects,
        total 
      };
    } catch (error) {
      throw new Error(`Error searching my projects: ${error}`);
    }
  }
} 