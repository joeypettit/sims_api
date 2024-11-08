import express from "express";
const router = express.Router();
import prisma from "../../prisma/prisma-client";
import type { LineItemOption, OptionTier } from "@prisma/client";
import { removeKeysWhereUndefined } from "../util";
import { OptionsService } from "../services/options-services";

const optionsService = new OptionsService();

router.get("/:lineItemId", async (req, res) => {
  console.log("Getting line item");
  const lineItemId = req.params.lineItemId;

  try {
    if (!lineItemId) {
      res.status(400).json({ error: "Line item ID is required" });
      return;
    }

    const result = await prisma.lineItem.findUnique({
      where: {
        id: lineItemId,
      },
      select: {
        id: true,
        name: true,
        unit: true,
        quantity: true,
        marginDecimal: true,
        indexInGroup: true,
        lineItemGroupId: true,
        lineItemOptions: {
          select: {
            id: true,
            description: true,
            exactCostInDollarsPerUnit: true,
            highCostInDollarsPerUnit: true,
            lowCostInDollarsPerUnit: true,
            isSelected: true,
            optionTier: true,
            priceAdjustmentDecimal: true,
          },
        },
      },
    });

    // If no line item is found, return a 404
    if (!result) {
      res.status(404).json({ error: "Line item not found" });
      return;
    }

    // Send the result if found
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching line item:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching line item" });
  }
});

router.post("/create-blank", async (req, res) => {
  const { groupId } = req.body;
  console.log("creating blank", groupId);

  let lastIndex = 0;
  let optionTiers: OptionTier[] = [];

  if (!groupId) {
    res.status(400).json({
      error: "groupId required",
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
    optionTiers = await prisma.optionTier.findMany({});
  } catch (error) {
    console.error("Error querying option tiers:", error);
  }

  try {
    const newLineItem = await prisma.lineItem.create({
      data: {
        lineItemGroupId: groupId,
        name: "",
        marginDecimal: 0.1,
        quantity: 0,
        indexInGroup: lastIndex + 1,
        lineItemOptions: {
          create: [
            {
              description: "",
              priceAdjustmentDecimal: 0,
              exactCostInDollarsPerUnit: null,
              highCostInDollarsPerUnit: 0,
              lowCostInDollarsPerUnit: 0,
              isSelected: false,
              optionTierId: optionTiers.find((tier) => tier.tierLevel == 1)?.id,
            },
            {
              description: "",
              priceAdjustmentDecimal: 0,
              exactCostInDollarsPerUnit: null,
              highCostInDollarsPerUnit: 0,
              lowCostInDollarsPerUnit: 0,
              isSelected: false,
              optionTierId: optionTiers.find((tier) => tier.tierLevel == 2)?.id,
            },
            {
              description: "",
              priceAdjustmentDecimal: 0,
              exactCostInDollarsPerUnit: null,
              highCostInDollarsPerUnit: 0,
              lowCostInDollarsPerUnit: 0,
              isSelected: false,
              optionTierId: optionTiers.find((tier) => tier.tierLevel == 3)?.id,
            },
          ],
        },
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

router.put("/:lineItemId", async (req, res) => {
  const { name, marginDecimal, groupId, unitId, quantity, lineItemOptions } =
    req.body;
  const { lineItemId } = req.params;

  if (
    !name &&
    !marginDecimal &&
    !groupId &&
    !unitId &&
    !quantity &&
    !lineItemOptions
  ) {
    res.status(400).json({
      error:
        "No data was recieved to update this lineitem. Please put the data into the request body.",
    });
    return;
  }

  let lineDataObj: any = {
    name,
    marginDecimal,
    quantity,
    lineItemGroup: undefined,
    unit: undefined,
  };
  if (groupId) {
    lineDataObj.lineItemGroup = {
      connect: { id: groupId },
    };
  }
  if (unitId) {
    lineDataObj.unit = {
      connect: { id: unitId },
    };
  }
  console.log("data obj", lineDataObj);
  lineDataObj = removeKeysWhereUndefined(lineDataObj);
  console.log("cleaned DATA OBJ", lineDataObj);

  console.log("LINE ITEM OPTIONS", lineItemOptions);

  await lineItemOptions.map(async (option: any) => {
    try {
      await optionsService.update({
        optionId: option.id,
        description: option.description,
        exactCostInDollarsPerUnit: option.exactCostInDollarsPerUnit,
        highCostInDollarsPerUnit: option.highCostInDollarsPerUnit,
        lowCostInDollarsPerUnit: option.lowCostInDollarsPerUnit,
        priceAdjustmentDecimal: option.priceAdjustmentDecimal,
        isSelected: option.isSelected,
        optionTierId: option.optionTier.id,
      });
    } catch (error) {
      console.log(`Error updating Option with id: ${option.id}`);
      res.status(500).json({
        error: `An error occurred while updating the line item option with id ${option.id}`,
      });
    }
  });

  try {
    // Update the line item with new data
    const updatedLineItem = await prisma.lineItem.update({
      where: { id: lineItemId },
      data: lineDataObj,
      select: {
        id: true,
        name: true,
        unit: true,
        quantity: true,
        marginDecimal: true,
        lineItemGroup: true,
        indexInGroup: true,
        lineItemOptions: true,
      },
    });
    res.status(200).json(updatedLineItem);
  } catch (error) {
    console.error("Error updating line item:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the line item" });
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
