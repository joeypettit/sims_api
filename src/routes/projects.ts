import express from "express";
import { PrismaClient } from "@prisma/client";
const router = express.Router();
import prisma from "../../prisma/prisma-client";
import sortProjectAreasByGroup from "../utility/project-sort";

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
                  priceAdjustmentDecimal: true,
                  productTier: {
                    select: {
                      label: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  // sortProjectAreasByGroup(result);

  console.log("results:", result);
  res.send(result);
});

export default router;
