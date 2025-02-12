import express from "express";
import { ProjectAreasService } from "../services/project-areas-service";
const router = express.Router();
const projectAreaService = new ProjectAreasService();
import { isAuthenticated } from "../middleware/auth";

router.use(isAuthenticated);

router.post("/create-blank", async (req, res) => {
  const { name, projectId } = req.body;

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


router.get("/:areaId", async (req, res) => {
  const { areaId } = req.params;
  try {
    const projectArea = await projectAreaService.getById({ areaId })
    res.status(201).json(projectArea)
  }
  catch (error) {
    console.error(`Error getting Project Area with id ${areaId}`, error);
    res
      .status(500)
      .json({ error: "Error getting Project Area" });
  }
});

router.get("/:areaId/cost-range", async (req, res) => {
  const { areaId } = req.params;

  try {
    const costRange = await projectAreaService.calculateAreaCostRange(areaId);
    res.json(costRange);
  } catch (error) {
    console.error("Error getting area cost range:", error);
    res.status(500).json({ error: "Failed to calculate area cost range" });
  }
});

router.delete("/:areaId", async (req, res) => {
  const { areaId } = req.params;
  try {
    const deletedArea = await projectAreaService.deleteArea({ areaId });
    res.status(200).json(deletedArea);
  } catch (error) {
    console.error(`Error deleting Project Area with id ${areaId}:`, error);
    res.status(500).json({ error: "Error deleting Project Area" });
  }
});

export default router;
