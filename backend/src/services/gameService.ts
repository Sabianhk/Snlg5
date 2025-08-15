import { prisma } from "@lib/prisma";
import { env } from "@config/env";

// Magic Bridges (ladders) and Portal Traps (snakes)
const magicBridges: Record<number, number> = {
  2: 38,
  7: 14,
  8: 31,
  15: 26,
  21: 42,
  28: 84,
  36: 44,
  51: 67,
  71: 91,
  78: 98,
};

const portalTraps: Record<number, number> = {
  16: 6,
  46: 25,
  49: 11,
  62: 19,
  64: 60,
  74: 53,
  89: 68,
  92: 88,
  95: 75,
  99: 80,
};

export async function createGame(hostUserId: string) {
  const game = await prisma.game.create({ data: { status: "PENDING" } });
  await prisma.gameParticipant.create({ data: { gameId: game.id, userId: hostUserId, position: 0 } });
  return game;
}

export async function joinGame(gameId: string, userId: string) {
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) throw { status: 404, message: "Game not found" };
  if (game.status === "COMPLETED") throw { status: 400, message: "Game already completed" };
  const count = await prisma.gameParticipant.count({ where: { gameId } });
  if (count >= 4) throw { status: 400, message: "Game is full" };
  await prisma.gameParticipant.create({ data: { gameId, userId, position: 0 } });
  if (game.status === "PENDING") {
    await prisma.game.update({ where: { id: gameId }, data: { status: "IN_PROGRESS" } });
  }
}

export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export async function makeMove(gameId: string, userId: string, dice?: number, playToken?: string) {
  if (env.requirePlayToken) {
    const token = await prisma.adminLog.findFirst({ where: { target: `play:${gameId}:${userId}`, action: "grant" } });
    if (!token || (playToken && playToken !== token.id)) {
      throw { status: 403, message: "Play token required" };
    }
  }
  const participant = await prisma.gameParticipant.findFirst({ where: { gameId, userId } });
  if (!participant) throw { status: 404, message: "Player not in this game" };

  const value = dice ?? rollDice();
  const fromSquare = participant.position;
  let tentative = fromSquare + value;
  if (tentative > 100) tentative = fromSquare; // must roll exact to land on 100

  let toSquare = tentative;
  if (magicBridges[toSquare]) toSquare = magicBridges[toSquare];
  else if (portalTraps[toSquare]) toSquare = portalTraps[toSquare];

  await prisma.gameParticipant.update({ where: { id: participant.id }, data: { position: toSquare } });
  await prisma.move.create({
    data: {
      gameId,
      playerId: userId,
      diceValue: value,
      fromSquare,
      toSquare,
    },
  });

  let winnerId: string | null = null;
  if (toSquare === 100) {
    winnerId = userId;
    await prisma.game.update({ where: { id: gameId }, data: { status: "COMPLETED", winnerId, completedAt: new Date() } });

    // assign final ranks in order of reaching 100 (simplified: winner gets 1)
    await prisma.gameParticipant.update({ where: { id: participant.id }, data: { finalRank: 1 } });
  }

  const state = await getGameState(gameId);
  return { move: { diceValue: value, fromSquare, toSquare }, state };
}

export async function getGameState(gameId: string) {
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) throw { status: 404, message: "Game not found" };
  const participants = await prisma.gameParticipant.findMany({ where: { gameId }, include: { user: true } });
  const moves = await prisma.move.findMany({ where: { gameId }, orderBy: { createdAt: "asc" } });
  return { game, participants, moves };
}

export const BoardConfig = {
  size: 100,
  bridges: magicBridges,
  traps: portalTraps,
};