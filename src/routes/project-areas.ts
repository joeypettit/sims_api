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

router.post("/create-from-template", async (req, res) => {
  const { name, projectId, templateId } = req.body;
  console.log("creating from template", name, projectId, templateId);

  if (!projectId || !templateId) {
    res.status(400).json({
      error: "projectId and templateId are required",
    });
    return;
  }

  try {
    const newProjectArea = await projectAreaService.createFromTemplate({
      name,
      projectId,
      templateId,
    });
    res.status(201).json(newProjectArea);
  } catch (error) {
    console.error("Error creating Project Area from Template:", error);
    res
      .status(500)
      .json({ error: "Error Creating Project Area from Template" });
  }
});

export default router;
