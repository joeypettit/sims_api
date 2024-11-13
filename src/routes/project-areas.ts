import { ProjectAreaService } from "../services/project-area-services";
import express from "express";
const router = express.Router();
const projectAreaService = new ProjectAreaService();

router.post("/create-blank", async (req, res) => {
  const { name, projectId } = req.body;
  console.log("creating blank", name, projectId);

  if (!projectId) {
    res.status(400).json({
      error: "projectId required",
    });
    return;
  }

  try {
    const newProjectArea = await projectAreaService.createBlank({
      name,
      projectId,
    });
    res.status(201).json(newProjectArea);
  } catch (error) {
    console.error("Error creating New Project Area:", error);
    res.status(500).json({ error: "Error Creating New Project Area" });
  }
});

export default router;
