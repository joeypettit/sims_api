import LineItemsRepo from "../repository/line-items-repo";
import { OptionsService } from "./options-services";

const lineItemsRepo = new LineItemsRepo();
const optionsService = new OptionsService();

export class LineItemsService {

  async updateIndexInGroup({ lineItemId, indexInGroup }: { lineItemId: string, indexInGroup: number }) {
    try{
      const lineItem = await lineItemsRepo.updateIndexInGroup({ lineItemId, indexInGroup })
      return lineItem
    } catch(error){
      console.error("Error updating index in group", error)
      throw error
    }
  }

  buildDuplicateData(item: any) {
    return {
      name: item.name,
      quantity: item.quantity,
      unitId: item.unitId,
      marginDecimal: item.marginDecimal,
      indexInGroup: item.indexInGroup,
      lineItemOptions: {
        create: item.lineItemOptions.map((option: any) => 
          optionsService.buildDuplicateData(option)
        ),
      },
    };
  }
}
