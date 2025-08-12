import { Router } from "express";
import { prisma } from "@lib/prisma";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const achievements = await prisma.achievement.findMany({ orderBy: { name: "asc" } });
    res.json({ achievements });
  } catch (err) {
    next(err);
  }
});

export default router;