import { Router } from "express";
import { requireAuth } from "@middleware/auth";
import { z } from "zod";
import { createGame, getGameState, joinGame, makeMove } from "@services/gameService";

const router = Router();

router.post("/create", requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).userId as string;
    const game = await createGame(userId);
    res.status(201).json({ game });
  } catch (err) {
    next(err);
  }
});

router.post("/join/:gameId", requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).userId as string;
    const { gameId } = req.params;
    await joinGame(gameId, userId);
    const state = await getGameState(gameId);
    res.json({ state });
  } catch (err) {
    next(err);
  }
});

const moveSchema = z.object({
  gameId: z.string(),
  dice: z.number().int().min(1).max(6).optional(),
  playToken: z.string().optional(),
});

router.post("/move", requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).userId as string;
    const { gameId, dice, playToken } = moveSchema.parse(req.body);
    const result = await makeMove(gameId, userId, dice, playToken);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/:gameId/state", requireAuth, async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const state = await getGameState(gameId);
    res.json({ state });
  } catch (err) {
    next(err);
  }
});

export default router;