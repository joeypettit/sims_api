import express from "express";
const router = express.Router();
import prisma from "../../prisma/prisma-client";

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

export default router;
