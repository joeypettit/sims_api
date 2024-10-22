import express from "express";
const router = express.Router();
import prisma from "../../prisma/prisma-client";

router.get("/all-categories", async (req, res) => {
  const result = await prisma.groupCategory.findMany();
  res.send(result);
});

export default router;
