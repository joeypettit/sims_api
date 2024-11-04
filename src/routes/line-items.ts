import express from "express";
const router = express.Router();
import prisma from "../../prisma/prisma-client";

router.post("/", async (req, res) => {
  const { name, marginDecimal, groupId, unitId, quantity } = req.body;
  let lastIndex = 0;

  if (!name || !marginDecimal || !groupId || !unitId || !quantity) {
    res.status(400).json({
      error: "name, marginDecimal, groupId, unitId, quantity is required",
    });
    return;
  }

  try {
    const lineItemsInGroup = await prisma.lineItem.findMany({
      where: {
        lineItemGroupId: groupId,
      },
    });
    lastIndex = lineItemsInGroup.reduce((acc, current) => {
      if (acc > current.indexInGroup) return acc;
      return current.indexInGroup;
    }, 0);
  } catch (error) {
    console.error("Error finding last index of line items in group:", error);
  }

  try {
    const newLineItem = await prisma.lineItem.create({
      data: {
        name,
        lineItemGroupId: groupId,
        marginDecimal,
        quantity,
        unitId,
        indexInGroup: lastIndex + 1,
      },
    });
    res.status(201).json(newLineItem);
  } catch (error) {
    console.error("Error creating new line item:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating new line item" });
  }
});

// define the home page route
router.put("/:lineItemId/select-option/:optionId", async (req, res) => {
  const { lineItemId, optionId } = req.params;

  const result = await prisma.lineItemOption.update({
    where: {
      id: optionId,
    },
    data: {
      isSelected: true,
    },
  });

  res.send(result);
});

router.put("/:lineItemId/update-quantity", async (req, res) => {
  const { lineItemId } = req.params;
  const { quantity } = req.body;

  console.log("updating q", quantity, lineItemId);

  if (quantity == null || typeof quantity !== "number" || quantity < 0) {
    res.status(400).json({ error: "Invalid quantity" });
    return;
  }

  try {
    const updatedLineItem = await prisma.lineItem.update({
      where: {
        id: lineItemId,
      },
      data: {
        quantity,
      },
    });

    res.json(updatedLineItem);
  } catch (error) {
    console.error("Error updating line item quantity:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:lineItemId/unselect-option/:optionId", async (req, res) => {
  const { lineItemId, optionId } = req.params;

  const result = await prisma.lineItemOption.update({
    where: {
      id: optionId,
    },
    data: {
      isSelected: false,
    },
  });

  res.send(result);
});

export default router;
