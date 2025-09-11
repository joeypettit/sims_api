import { LineItemOption } from "@prisma/client";
import { removeKeysWhereUndefined } from "../util";
import prisma from "../../prisma/prisma-client";

type UpdateParams = {
  optionId: string;
  description?: string;
  priceAdjustmentMultiplier?: number;
  exactCostInDollarsPerUnit?: number | null;
  highCostInDollarsPerUnit?: number | null;
  lowCostInDollarsPerUnit?: number | null;
  isSelected?: boolean;
  optionTierId?: string | null;
};

export class OptionsService {
  async update({
    optionId,
    description,
    priceAdjustmentMultiplier,
    exactCostInDollarsPerUnit,
    highCostInDollarsPerUnit,
    lowCostInDollarsPerUnit,
    isSelected,
    optionTierId,
  }: UpdateParams) {
    let dataObj: any = {
      description,
      priceAdjustmentMultiplier,
      exactCostInDollarsPerUnit,
      highCostInDollarsPerUnit,
      lowCostInDollarsPerUnit,
      isSelected,
    };
    if (optionTierId) {
      dataObj.optionTier = { connect: { id: optionTierId } };
    }
    dataObj = removeKeysWhereUndefined(dataObj);

    try {
      const updatedOption = await prisma.lineItemOption.update({
        where: { id: optionId },
        data: dataObj,
      });
      return updatedOption;
    } catch (error) {
      console.error(`Error updating option ${optionId}:`, error);
      throw Error("");
    }
  }

  buildDuplicateData(option: any) {
    return {
      description: option.description,
      lowCostInDollarsPerUnit: option.lowCostInDollarsPerUnit,
      highCostInDollarsPerUnit: option.highCostInDollarsPerUnit,
      exactCostInDollarsPerUnit: option.exactCostInDollarsPerUnit,
      priceAdjustmentMultiplier: option.priceAdjustmentMultiplier,
      isSelected: option.isSelected,
      optionTierId: option.optionTierId,
    };
  }
}
