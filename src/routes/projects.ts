import express from "express";
const router = express.Router();
import prisma from "../../prisma/prisma-client";
import sortProjectAreasByGroup from "../utility/project-sort";
import { removeKeysWhereUndefined, simulateNetworkLatency } from "../util";

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

// define the about route
router.get("/:projectId", async (req, res) => {
  console.log("getting project");
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

router.get("/area/:areaId", async (req, res) => {
  const { areaId } = req.params;
  const result = await prisma.projectArea.findUnique({
    where: {
      id: areaId,
    },
    select: {
      id: true,
      name: true,
      lineItemGroups: {
        select: {
          id: true,
          name: true,
          groupCategory: true,
          lineItems: {
            select: {
              id: true,
              marginDecimal: true,
              quantity: true,
              name: true,
              unit: true,
              lineItemGroup: {
                select: {
                  groupCategory: true,
                },
              },
              lineItemOptions: {
                select: {
                  id: true,
                  description: true,
                  exactCostInDollarsPerUnit: true,
                  lowCostInDollarsPerUnit: true,
                  highCostInDollarsPerUnit: true,
                  isSelected: true,
                  priceAdjustmentMultiplier: true,
                  optionTier: {
                    select: {
                      name: true,
                      tierLevel: true,
                    },
                  },
                },
                orderBy: {
                  optionTier: {
                    tierLevel: "asc",
                  },
                },
              },
            },
            orderBy: {
              indexInGroup: "asc",
            },
          },
        },
      },
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
  console.log("data obj", projectDataObj);
  projectDataObj = removeKeysWhereUndefined(projectDataObj);
  console.log("cleaned DATA OBJ", projectDataObj);

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

export default router;
