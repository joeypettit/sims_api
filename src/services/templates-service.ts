import { LineItemsService } from "./line-items-service";
import { GroupsService } from "./groups-service";
import { OptionsService } from "./options-services";
import TemplatesRepo from "../repository/templates-repo";
import { ProjectAreasService } from "./project-areas-service";
import prisma from "../../prisma/prisma-client";

const templatesRepo = new TemplatesRepo();
const lineItemService = new LineItemsService();
const groupService = new GroupsService();
const optionsService = new OptionsService();
const projectAreaService = new ProjectAreasService();

export class TemplatesService {
  async getById({ templateId }: { templateId: string }) {
    return await templatesRepo.findById({ templateId });
  }

  async create({ name }: { name: string }) {
    try {
      // Create a blank project area first
      const newArea = await prisma.projectArea.create({ 
        data: {} 
      });
      
      // Create the template linked to the area
      const newTemplate = await templatesRepo.create({
        name,
        projectAreaId: newArea.id,
      });
      
      return newTemplate;
    } catch (error) {
      console.error(`Error creating template with name ${name}:`, error);
      throw error;
    }
  }

  async delete({ templateId }: { templateId: string }) {
    try {
      await templatesRepo.delete({ templateId });
    } catch (error) {
      console.error(`Error deleting template ${templateId}:`, error);
      throw error;
    }
  }

  async duplicate({ templateId, name }: { templateId: string; name: string }) {
    try {
      // Get the original template with its project area data
      const originalTemplate = await templatesRepo.findById({ templateId });

      if (!originalTemplate) {
        throw new Error(`Template with ID ${templateId} not found`);
      }

      // Use the project area service's buildDuplicateData method with isTemplate = true
      const duplicateData = projectAreaService.buildDuplicateData(
        originalTemplate.projectArea, 
        name, 
        true // isTemplate = true
      );

      // Create the duplicated template using Prisma directly
      const duplicatedTemplate = await prisma.areaTemplate.create({
        data: {
          name,
          projectArea: {
            create: duplicateData
          }
        },
        select: {
          id: true
        }
      });

      return { id: duplicatedTemplate.id };
    } catch (error) {
      console.error(`Error duplicating template ${templateId}:`, error);
      throw error;
    }
  }
}