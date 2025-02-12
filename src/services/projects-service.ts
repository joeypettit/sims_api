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
} 