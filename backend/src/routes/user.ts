import { Router } from "express";
import { env } from "@config/env";
import { requireAuth } from "@middleware/auth";
import { prisma } from "@lib/prisma";
import { z } from "zod";

const router = Router();

router.get("/profile", requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).userId as string;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    res.json({ user: user && { id: user.id, username: user.username, email: user.email, avatarUrl: user.avatarUrl } });
  } catch (err) {
    next(err);
  }
});

router.get("/admin/me", requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).userId as string;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isAdmin = !!user && user.email === env.adminEmail && env.adminEmail !== "";
    res.json({ admin: isAdmin });
  } catch (err) {
    next(err);
  }
});

const updateSchema = z.object({ username: z.string().min(3).max(24).optional(), avatarUrl: z.string().url().optional() });

router.put("/profile", requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).userId as string;
    const data = updateSchema.parse(req.body);
    const user = await prisma.user.update({ where: { id: userId }, data });
    res.json({ user: { id: user.id, username: user.username, email: user.email, avatarUrl: user.avatarUrl } });
  } catch (err) {
    next(err);
  }
});

router.get("/stats", requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).userId as string;
    const totalMoves = await prisma.move.count({ where: { playerId: userId } });
    const wins = await prisma.game.count({ where: { winnerId: userId } });
    const gamesPlayed = await prisma.gameParticipant.count({ where: { userId } });
    res.json({ stats: { gamesPlayed, wins, totalMoves } });
  } catch (err) {
    next(err);
  }
});

router.get("/games", requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).userId as string;
    const games = await prisma.gameParticipant.findMany({ where: { userId }, include: { game: true } });
    res.json({ games });
  } catch (err) {
    next(err);
  }
});

export default router;