import express from "express";
const router = express.Router();
import prisma from "../../prisma/prisma-client";
import { simulateNetworkLatency } from "../util";

router.post("/area/create", async (req, res) => {
  const { name } = req.body;
  try {
    const newTemplate = await prisma.template.create({
      data: {
        name,
      },
    });

    await simulateNetworkLatency(5000);

    console.log("new template", newTemplate);

    res.json(newTemplate);
  } catch (error) {
    console.error("Error updating line item quantity:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
