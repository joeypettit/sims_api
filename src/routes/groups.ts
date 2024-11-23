import express from "express";
const router = express.Router();
import prisma from "../../prisma/prisma-client";
import type { GroupCategory } from "@prisma/client";
import { GroupsService } from "../services/groups-service";

const groupsService = new GroupsService()

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
    // Create a new LineItemGroup
    const newGroup = await prisma.lineItemGroup.create({
      data: {
        name: groupName,
        groupCategory: {
          connect: { id: categoryId },
        },
        projectArea: {
          connect: { id: projectAreaId },
        },
      },
      select: {
        id: true,
        name: true,
        projectAreaId: true,
        groupCategoryId: true,
      },
    });

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
  const result = groupsService.setIsOpenOnAllGroupsInArea({ areaId, isOpen })
  res.send(result);
});
export default router;
