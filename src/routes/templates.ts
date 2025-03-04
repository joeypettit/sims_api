import express from "express";
const router = express.Router();
import prisma from "../../prisma/prisma-client";
import { simulateNetworkLatency } from "../util";
import { ProjectArea } from "@prisma/client";
import { AreaTemplate } from "@prisma/client";
import { isAuthenticated } from "../middleware/auth";

router.use(isAuthenticated);

router.get("/area/all-templates", async (req, res) => {
  try {
    const templates = await prisma.areaTemplate.findMany({
      select: {
        id: true,
        name: true,
        projectAreaId: true,
      },
    });
    res.json(templates);
  } catch (error) {
    console.log("error getting all templates", error);
    res.status(500).json({ error: error });
  }
});

router.get("/area/:templateId", async (req, res) => {
  const { templateId } = req.params;
  try {
    const template = await prisma.areaTemplate.findUnique({
      where: {
        id: templateId,
      },
      select: {
        id: true,
        name: true,
        projectAreaId: true,
        projectArea: {
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
        },
      },
    });
    res.json(template);
  } catch (error) {
    console.log("error getting template", error);
    res.status(500).json({ error: error });
  }

});

router.post("/area/create", async (req, res) => {
  const { name, projectAreaId } = req.body;
  let newArea: ProjectArea | undefined = undefined;
  let newTemplate: AreaTemplate | undefined = undefined;
  try {
    newArea = await prisma.projectArea.create({ data: {} });
  } catch (error) {
    console.log("Error Creating Area For New Area Template");
    res.status(500).json({ error: error });
  }
  if (newArea) {
    try {
      newTemplate = await prisma.areaTemplate.create({
        data: {
          name,
          projectAreaId: newArea.id,
        },
      });
    } catch (error) {
      console.log("Error Creating Area Template");
      res.status(500).json({ error: error });
    }
  }
  res.json(newTemplate);
});

router.delete('/area/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;
    
    await prisma.areaTemplate.delete({
      where: { id: templateId }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

export default router;
