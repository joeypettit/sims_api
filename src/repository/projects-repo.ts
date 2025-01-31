import prisma from "../../prisma/prisma-client";
import { Prisma } from "@prisma/client";

export default class ProjectsRepo {
  async search({ 
    query, 
    skip, 
    limit 
  }: { 
    query: string, 
    skip: number, 
    limit: number 
  }) {
    const whereClause: Prisma.ProjectWhereInput = {
      OR: [
        { name: { contains: query, mode: Prisma.QueryMode.insensitive } },
        {
          clients: {
            some: {
              OR: [
                { firstName: { contains: query, mode: Prisma.QueryMode.insensitive } },
                { lastName: { contains: query, mode: Prisma.QueryMode.insensitive } }
              ]
            }
          }
        }
      ]
    };

    try {
      const [projects, total] = await Promise.all([
        prisma.project.findMany({
          where: whereClause,
          include: {
            clients: true,
            users: true,
          },
          skip,
          take: limit,
          orderBy: {
            name: 'asc'
          }
        }),
        prisma.project.count({
          where: whereClause
        })
      ]);

      return { projects, total };
    } catch (error) {
      throw new Error(`Error searching projects: ${error}`);
    }
  }
} 
