import LineItemsRepo from "../repository/line-items-repo";

const lineItemsRepo = new LineItemsRepo();

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
}
