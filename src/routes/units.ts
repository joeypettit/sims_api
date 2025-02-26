import express from "express";
const router = express.Router();
import prisma from "../../prisma/prisma-client";
import { isAuthenticated } from "../middleware/auth";

router.use(isAuthenticated);

router.get("/", async (req, res) => {
  try {
    const result = await prisma.lineItemUnit.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    res.status(200).send(result);
  } catch (error) {
    console.error("Error fetching units:", error);
    res.status(500).json({ error: "An error occurred while fetching units." });
  }
});

router.post("/", async (req, res) => {
  const { unitName } = req.body;

  if (!unitName) {
    res.status(400).json({ error: "Unit name is required" });
    return;
  }

  try {
    const newUnit = await prisma.lineItemUnit.create({
      data: {
        name: unitName,
      },
    });

    res.status(201).json(newUnit);
  } catch (error) {
    console.error("Error creating new unit:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating new unit" });
  }
});

router.delete("/:unitId", async (req, res) => {
  const { unitId } = req.params;

  try {
    // Check if the unit is being used by any line items
    const lineItemsUsingUnit = await prisma.lineItem.findFirst({
      where: {
        unitId: unitId
      }
    });

    if (lineItemsUsingUnit) {
      res.status(400).json({ error: "Cannot delete unit as it is being used by line items" });
      return;
    }

    await prisma.lineItemUnit.delete({
      where: {
        id: unitId
      }
    });

    res.status(200).json({ message: "Unit deleted successfully" });
  } catch (error) {
    console.error("Error deleting unit:", error);
    res.status(500).json({ error: "An error occurred while deleting the unit" });
  }
});

export default router;
