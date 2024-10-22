import express from "express";
import { PrismaClient } from "@prisma/client";
const router = express.Router();
import prisma from "../../prisma/prisma-client";

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

  if (quantity == null || typeof quantity !== "number" || quantity <= 0) {
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
