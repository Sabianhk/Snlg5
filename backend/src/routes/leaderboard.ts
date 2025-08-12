import { Router } from "express";
import { prisma } from "@lib/prisma";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const leaders = await prisma.user.findMany({
      take: 50,
      orderBy: { lastLoginAt: "desc" },
      select: { id: true, username: true, avatarUrl: true },
    });
    res.json({ leaderboard: leaders });
  } catch (err) {
    next(err);
  }
});

export default router;