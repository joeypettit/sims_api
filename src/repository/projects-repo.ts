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
            stars: true,
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

  async starProject(userId: string, projectId: string) {
    return prisma.projectStar.create({
      data: {
        userId,
        projectId
      }
    });
  }

  async unstarProject(userId: string, projectId: string) {
    return prisma.projectStar.delete({
      where: {
        userId_projectId: {
          userId,
          projectId
        }
      }
    });
  }

  async isProjectStarred(userId: string, projectId: string) {
    const star = await prisma.projectStar.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId
        }
      }
    });
    return !!star;
  }

  async getStarredProjects(userId: string) {
    return prisma.project.findMany({
      where: {
        stars: {
          some: {
            userId
          }
        }
      },
      include: {
        clients: true,
        users: true
      }
    });
  }

  async searchMyProjects({ query, skip, limit, userId }: { query: string, skip: number, limit: number, userId: string }) {
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
      ],
      AND: {
        OR: [
          { users: { some: { id: userId } } },  // Projects where user is a member
          { stars: { some: { userId } } }       // Starred projects
        ]
      }
    };

    try {
      const [projects, total] = await Promise.all([
        prisma.project.findMany({
          where: whereClause,
          include: {
            clients: true,
            users: true,
            stars: true,
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
      throw new Error(`Error searching my projects: ${error}`);
    }
  }
} 
