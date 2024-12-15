import prisma from "../../prisma/prisma-client";
import { lineItemFullSelect } from "./query-objects";


export default class LineItemsRepo {

  async findById({ lineItemId }: { lineItemId: string }) {
    try {
      const result = await prisma.lineItem.findUnique({
        where: {
          id: lineItemId,
        },
        ...lineItemFullSelect,
      });
      return result;
    }
    catch (error) {
      throw Error(`Error finding lineItem with id ${lineItemId}`)
    }
  }

}
