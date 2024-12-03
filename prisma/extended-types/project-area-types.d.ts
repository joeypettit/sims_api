import { Prisma } from "@prisma/client";
const projecAreaWGroupsConfig = Prisma.validator<Prisma.ProjectAreaDefaultArgs>()({
  include: { lineItemGroups: true }
});

export type ProjectAreaWithGroups = Prisma.UserGetPayload<typeof userWithPosts>
