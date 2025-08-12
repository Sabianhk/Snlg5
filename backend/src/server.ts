import http from "http";
import { Server } from "socket.io";
import { createApp } from "./app";
import { env } from "@config/env";
import { getGameState, makeMove } from "@services/gameService";

const app = createApp();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: env.corsOrigin,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("join_game", async ({ gameId }: { gameId: string }) => {
    socket.join(gameId);
    const state = await getGameState(gameId).catch(() => null);
    if (state) io.to(gameId).emit("game_state", state);
  });

  socket.on("make_move", async ({ gameId, userId, dice }: { gameId: string; userId: string; dice?: number }) => {
    try {
      const result = await makeMove(gameId, userId, dice);
      io.to(gameId).emit("move_made", result);
    } catch (err) {
      socket.emit("error_message", (err as any).message ?? "Failed to make move");
    }
  });
});

server.listen(env.port, () => {
  console.log(`API listening on http://localhost:${env.port}`);
});