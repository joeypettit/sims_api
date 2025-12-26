import express from "express";
import { ProjectAreasService } from "../services/project-areas-service";
import { LineItemsService } from "../services/line-items-service";
const router = express.Router();
const projectAreaService = new ProjectAreasService();
const lineItemsService = new LineItemsService();
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

router.post("/:areaId/duplicate", async (req, res) => {
  const { areaId } = req.params;
  const { name } = req.body;

  if (!name || name.trim() === "") {
    res.status(400).json({
      error: "name is required",
    });
    return;
  }

  try {
    const result = await projectAreaService.duplicate({ 
      areaId, 
      name: name.trim()
    });
    res.status(201).json(result);
  } catch (error) {
    console.error(`Error duplicating Project Area with id ${areaId}:`, error);
    if ((error as Error).message.includes("not found")) {
      res.status(404).json({ error: (error as Error).message });
    } else {
      res.status(500).json({ error: "Error duplicating Project Area" });
    }
  }
});

router.put("/:areaId/update-all-margins", async (req, res) => {
  const { areaId } = req.params;
  const { marginPercentage } = req.body;

  if (marginPercentage === undefined || marginPercentage === null) {
    res.status(400).json({
      error: "marginPercentage is required",
    });
    return;
  }

  if (typeof marginPercentage !== "number" || marginPercentage < 0 || marginPercentage > 100) {
    res.status(400).json({
      error: "marginPercentage must be a number between 0 and 100",
    });
    return;
  }

  try {
    // Convert percentage to decimal (e.g., 52% -> 0.52)
    const marginDecimal = marginPercentage / 100;
    
    const result = await lineItemsService.updateAllMarginsInProjectArea({
      projectAreaId: areaId,
      marginDecimal: marginDecimal
    });

    res.status(200).json({
      message: "All line item margins updated successfully",
      updatedCount: result.count
    });
  } catch (error) {
    console.error(`Error updating margins for Project Area with id ${areaId}:`, error);
    res.status(500).json({ error: "Error updating line item margins" });
  }
});

export default router;
