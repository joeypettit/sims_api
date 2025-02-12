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
    },
  });
  res.send(result);
});

router.post("/create-blank", async (req, res) => {
  const { name, userId } = req.body;
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
        clients: { 
          create: [{ firstName: "", lastName: "" }]
        },
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
  const { query, page, limit } = req.query;

  try {
    const result = await projectsService.search({
      query: query as string,
      page: page as string,
      limit: limit as string
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error searching projects" });
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

export default router;
