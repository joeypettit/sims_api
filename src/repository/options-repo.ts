import { lineItemOptionFullSelect } from "./query-objects";

import { Prisma } from "@prisma/client";
import prisma from "../../prisma/prisma-client";
import ProjectAreaRepo from "./project-area-repo";


export default class LineItemOptionsRepo {

  async findById({ optionId }: { optionId: string }) {
    try {
      const result = await prisma.lineItemOption.findUnique({
        where: {
          id: optionId,
        },
        ...lineItemOptionFullSelect,
      });
      return result;
    }
    catch (error) {
      throw Error(`Error getting finding option with id ${optionId}`)
    }
  }

}
