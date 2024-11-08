import { LineItemOption } from "@prisma/client";
import { removeKeysWhereUndefined } from "../util";
import prisma from "../../prisma/prisma-client";

type UpdateParams = {
  optionId: string;
  description?: string;
  priceAdjustmentDecimal?: number;
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
    priceAdjustmentDecimal,
    exactCostInDollarsPerUnit,
    highCostInDollarsPerUnit,
    lowCostInDollarsPerUnit,
    isSelected,
    optionTierId,
  }: UpdateParams) {
    let dataObj: any = {
      description,
      priceAdjustmentDecimal,
      exactCostInDollarsPerUnit,
      highCostInDollarsPerUnit,
      lowCostInDollarsPerUnit,
      isSelected,
    };
    if (optionTierId) {
      dataObj.optionTier = { connect: { id: optionTierId } };
    }
    console.log("option data", dataObj);
    dataObj = removeKeysWhereUndefined(dataObj);
    console.log("clean option data", dataObj);

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
}
