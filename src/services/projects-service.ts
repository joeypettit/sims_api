import ProjectsRepo from "../repository/projects-repo";

const projectsRepo = new ProjectsRepo();

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
} 