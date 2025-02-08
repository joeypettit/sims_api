import express from "express";
const router = express.Router();
import prisma from "../../prisma/prisma-client";
import type { LineItemOption, OptionTier } from "@prisma/client";
import { removeKeysWhereUndefined } from "../util";
import { OptionsService } from "../services/options-services";
import { isAuthenticated } from "../middleware/auth";
const optionsService = new OptionsService();

router.use(isAuthenticated);

router.get("/:optionId", async (req, res) => {
  const lineItemId = req.params.optionId;

  try {
    if (!lineItemId) {
      res.status(400).json({ error: "Option ID is required" });
      return;
    }

    const result = undefined;

    if (!result) {
      res.status(404).json({ error: "option not found" });
      return;
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching option:", error);
    res.status(500).json({ error: "An error occurred while fetching option" });
  }
});

router.put("/:optionId", async (req, res) => {
  const {
    description,
    priceAdjustmentMultiplier,
    exactCostInDollarsPerUnit,
    highCostInDollarsPerUnit,
    lowCostInDollarsPerUnit,
    isSelected,
    optionTierId,
  } = req.body;
  const { optionId } = req.params;
  try {
    const option = await optionsService.update({
      optionId,
      description,
      exactCostInDollarsPerUnit,
      highCostInDollarsPerUnit,
      lowCostInDollarsPerUnit,
      priceAdjustmentMultiplier,
      isSelected,
      optionTierId,
    });
    res.status(200).json(option);
  } catch (error) {
    console.error("Error updating line item:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the line item" });
  }
});

export default router;
