import express from "express";
const router = express.Router();
import prisma from "../../prisma/prisma-client";
import type { GroupCategory } from "@prisma/client";
import { GroupsService } from "../services/groups-service";
import { isAuthenticated } from "../middleware/auth";
const groupsService = new GroupsService()

router.use(isAuthenticated);

router.get("/all-categories", async (req, res) => {
  let result: GroupCategory[] | null = null;
  try {
    result = await prisma.groupCategory.findMany();
  } catch (error) {
    console.log("Error fetching all group categories", error);
  }
  if (result) {
    res.send(result);
  }
});

router.post("/", async (req, res) => {
  const { categoryId, projectAreaId, groupName } = req.body;

  // Input validation
  if (!categoryId || !projectAreaId || !groupName) {
    res
      .status(400)
      .json({ error: "categoryId, projectAreaId, and name are required" });
    return;
  }

  try {
    const newGroup = await groupsService.createGroup({ categoryId, groupName, projectAreaId })
    res.status(201).json(newGroup);
  } catch (error) {
    console.error("Error creating new group:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the group" });
  }
});

router.put("/:groupId/update-isopen", async (req, res) => {
  const { groupId } = req.params;
  const { isOpen } = req.body;

  const result = await prisma.lineItemGroup.update({
    where: {
      id: groupId,
    },
    data: {
      isOpen: isOpen,
    },
  });

  res.send(result);
});


router.put("/update-isopen-by-area", async (req, res) => {
  const { isOpen, areaId } = req.body;
  const result = await groupsService.setIsOpenOnAllGroupsInArea({ areaId, isOpen })
  res.send(result);
})

router.put("/:groupId/set-index-in-category", async (req, res) => {
  const { groupId } = req.params;
  const { categoryId, newIndex } = req.body;
  try {
    const result = await groupsService.setGroupIndexInCategory({ groupId, categoryId, newIndex })
    res.send(result);
  } catch (error) {
    console.error("Error setting index in category:", error);
    res
      .status(500)
      .json({ error: "Error setting index in category" });
  }
});

// Update group name
router.put("/:groupId/update-name", async (req, res) => {
  const { groupId } = req.params;
  const { name } = req.body;

  if (!name || name.trim() === "") {
    res.status(400).json({ error: "Group name is required" });
    return;
  }

  try {
    const updatedGroup = await groupsService.updateGroupName({ groupId, name: name.trim() });
    res.json(updatedGroup);
  } catch (error) {
    console.error("Error updating group name:", error);
    res.status(500).json({ error: "An error occurred while updating the group name" });
  }
});

// Delete group
router.delete("/:groupId", async (req, res) => {
  const { groupId } = req.params;

  try {
    await groupsService.deleteGroup({ groupId });
    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error deleting group:", error);
    res.status(500).json({ error: "An error occurred while deleting the group" });
  }
});

export default router;
