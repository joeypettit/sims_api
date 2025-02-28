import express from "express";
import prisma from "../../prisma/prisma-client";
import { removeKeysWhereUndefined, simulateNetworkLatency } from "../util";
import { ProjectsService } from "../services/projects-service";
import { isAuthenticated } from "../middleware/auth";


const router = express.Router();
const projectsService = new ProjectsService();

// Apply isAuthenticated to all routes
router.use(isAuthenticated);

// define the home page route
router.get("/", async (req, res) => {
  const result = await prisma.project.findMany({
    select: {
      clients: true,
      name: true,
      users: true,
      id: true,
      startDate: true,
      endDate: true,
    },
  });
  res.send(result);
});

router.get("/get-by-id/:projectId", async (req, res) => {
  const projectId = req.params.projectId;
  const result = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      areas: true,
      description: true,
      clients: true,
      name: true,
      users: true,
      id: true,
      startDate: true,
      endDate: true,
    },
  });
  res.send(result);
});

router.post("/create-blank", async (req, res) => {
  const { name, userId, startDate, endDate } = req.body;
  if (!userId) {
    res.status(400).json({ error: "User ID is required" });
    return;
  }
  if (!name) {
    res.status(400).json({ error: "Name is required" });
    return;
  }
  try {
    const newProject = await prisma.project.create({
      data: {
        name: name,
        description: "",
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        users: { 
          connect: [{ id: userId }]
        },
      },
    });
    res.status(201).json(newProject);
  } catch (error) {
    console.error("Error creating new project:", error);
    res.status(500).json({ error: "An error occurred while creating new project" });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { query = '', page = '1', limit = '10' } = req.query;
    const userId = req.user!.id;  // Get the current user's ID
    
    const skip = (Number(page) - 1) * Number(limit);
    const result = await projectsService.searchProjects({ 
      query: query as string, 
      skip, 
      limit: Number(limit),
      userId  // Pass the userId to the service
    });

    res.json({
      projects: result.projects,
      pagination: {
        total: result.total,
        pages: Math.ceil(result.total / Number(limit)),
        currentPage: Number(page)
      }
    });
  } catch (error) {
    console.error('Error searching projects:', error);
    res.status(500).json({ error: 'Failed to search projects' });
  }
});

// Add user to project
router.post("/:projectId/users", isAuthenticated, async (req, res) => {
  const { projectId } = req.params;
  const { userId } = req.body;

  try {
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        users: {
          connect: { id: userId }
        }
      },
      include: {
        users: true
      }
    });
    res.json(updatedProject);
  } catch (error) {
    console.error("Error adding user to project:", error);
    res.status(500).json({ error: "Failed to add user to project" });
  }
});

// Remove user from project
router.delete("/:projectId/users/:userId", isAuthenticated, async (req, res) => {
  const { projectId, userId } = req.params;

  try {
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        users: {
          disconnect: { id: userId }
        }
      },
      include: {
        users: true
      }
    });
    res.json(updatedProject);
  } catch (error) {
    console.error("Error removing user from project:", error);
    res.status(500).json({ error: "Failed to remove user from project" });
  }
});

// Add client to project
router.post("/:projectId/clients", isAuthenticated, async (req, res) => {
  const { projectId } = req.params;
  const { clientId } = req.body;

  try {
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        clients: {
          connect: { id: clientId }
        }
      },
      include: {
        clients: true
      }
    });
    res.json(updatedProject);
  } catch (error) {
    console.error("Error adding client to project:", error);
    res.status(500).json({ error: "Failed to add client to project" });
  }
});

// Remove client from project
router.delete("/:projectId/clients/:clientId", isAuthenticated, async (req, res) => {
  const { projectId, clientId } = req.params;

  try {
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        clients: {
          disconnect: { id: clientId }
        }
      },
      include: {
        clients: true
      }
    });
    res.json(updatedProject);
  } catch (error) {
    console.error("Error removing client from project:", error);
    res.status(500).json({ error: "Failed to remove client from project" });
  }
});

// Add the cost range endpoint
router.get("/:projectId/cost-range", async (req, res) => {
  const { projectId } = req.params;

  try {
    const costRange = await projectsService.calculateProjectCostRange(projectId);
    res.json(costRange);
  } catch (error) {
    console.error("Error getting project cost range:", error);
    res.status(500).json({ error: "Failed to calculate project cost range" });
  }
});

router.patch('/:id/dates', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const projectId = req.params.id;
    
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      }
    });

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project dates' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    await prisma.project.delete({
      where: { id: projectId }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

router.post('/:projectId/star', async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user!.id;
    
    const star = await projectsService.starProject(userId, projectId);
    res.json(star);
  } catch (error) {
    console.error('Error starring project:', error);
    res.status(500).json({ error: 'Failed to star project' });
  }
});

router.delete('/:projectId/star', async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user!.id;
    
    await projectsService.unstarProject(userId, projectId);
    res.status(204).send();
  } catch (error) {
    console.error('Error unstarring project:', error);
    res.status(500).json({ error: 'Failed to unstar project' });
  }
});

router.get('/:projectId/star', async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user!.id;
    
    const isStarred = await projectsService.isProjectStarred(userId, projectId);
    res.json({ isStarred });
  } catch (error) {
    console.error('Error checking project star status:', error);
    res.status(500).json({ error: 'Failed to check star status' });
  }
});

router.get('/starred', async (req, res) => {
  try {
    const userId = req.user!.id;
    const projects = await projectsService.getStarredProjects(userId);
    res.json(projects);
  } catch (error) {
    console.error('Error getting starred projects:', error);
    res.status(500).json({ error: 'Failed to get starred projects' });
  }
});

router.get('/my-projects', async (req, res) => {
  try {
    const { query = '', page = '1', limit = '10' } = req.query;
    const userId = req.user!.id;
    
    const result = await projectsService.searchMyProjects({ 
      query: query as string, 
      skip: (Number(page) - 1) * Number(limit),
      limit: Number(limit),
      userId
    });

    res.json({
      projects: result.projects,
      pagination: {
        total: result.total,
        pages: Math.ceil(result.total / Number(limit)),
        currentPage: Number(page)
      }
    });
  } catch (error) {
    console.error('Error getting my projects:', error);
    res.status(500).json({ error: 'Failed to get my projects' });
  }
});

export default router;
