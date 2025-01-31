import express from "express";
const router = express.Router();
import prisma from "../../prisma/prisma-client";
import { removeKeysWhereUndefined, simulateNetworkLatency } from "../util";
import { ProjectsService } from "../services/projects-service";

const projectsService = new ProjectsService();

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
  const { name } = req.body;
  try {
    const newProject = await prisma.project.create({
      data: {
        name: name,
        description: "",
        clients: { create: { firstName: "", lastName: "" } },
        users: { create: { firstName: "", lastName: "" } },
      },
    });
    res.status(201).json(newProject);
  } catch (error) {
    console.error("Error creating new project:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating new project" });
  }
});

router.put("/:projectId", async (req, res) => {

  const {
    name,
    clientFirstName,
    clientLastName,
    clientId,
    salesPersonFirstName,
    salesPersonLastName,
    salesPersonId,
    description,
  } = req.body;
  const { projectId } = req.params;

  let projectDataObj: any = {
    name,
    description,
  };
  if (clientFirstName || clientLastName) {
    projectDataObj.clients = {
      update: {
        where: {
          id: clientId,
        },
        data: {
          firstName: clientFirstName,
          lastName: clientLastName,
        },
      },
    };
  }
  if (salesPersonFirstName || salesPersonLastName) {
    projectDataObj.users = {
      update: {
        where: {
          id: salesPersonId,
        },
        data: {
          firstName: salesPersonFirstName,
          lastName: salesPersonLastName,
        },
      },
    };
  }
  projectDataObj = removeKeysWhereUndefined(projectDataObj);

  try {
    const updatedLineItem = await prisma.project.update({
      where: { id: projectId },
      data: projectDataObj,
    });
    res.status(200).json(updatedLineItem);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "An error occurred while updating project" });
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

export default router;
