"use client";

import { useEffect, useMemo, useState } from "react";
import Board, { PlayerState } from "@components/Board";
import { api } from "@lib/api";
import { socket } from "@lib/socket";

type User = { id: string; username: string; email: string };

export default function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string>("");
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [diceValue, setDiceValue] = useState<number | null>(null);

  const headers = useMemo(() => ({ Authorization: accessToken ? `Bearer ${accessToken}` : "" }), [accessToken]);

  useEffect(() => {
    socket.on("game_state", (state: any) => {
      const mapped: PlayerState[] = state.participants.map((p: any, idx: number) => ({
        userId: p.userId,
        position: p.position,
        color: ["#22d3ee", "#f472b6", "#a78bfa", "#34d399"][idx % 4],
      }));
      setPlayers(mapped);
    });
    socket.on("move_made", (payload: any) => {
      const { state } = payload;
      const mapped: PlayerState[] = state.participants.map((p: any, idx: number) => ({
        userId: p.userId,
        position: p.position,
        color: ["#22d3ee", "#f472b6", "#a78bfa", "#34d399"][idx % 4],
      }));
      setPlayers(mapped);
      setDiceValue(payload.move.diceValue);
    });
    return () => {
      socket.off("game_state");
      socket.off("move_made");
    };
  }, []);

  async function demoLogin() {
    const res = await api<{ user: User; accessToken: string; refreshToken: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "demo@example.com", password: "demopassword" }),
    });
    setUser(res.user);
    setAccessToken(res.accessToken);
  }

  async function createGame() {
    const res = await api<{ game: { id: string } }>("/api/game/create", { method: "POST", headers });
    setCurrentGameId(res.game.id);
    socket.connect();
    socket.emit("join_game", { gameId: res.game.id });
  }

  async function joinExisting() {
    if (!gameId) return;
    await api<{ state: any }>(`/api/game/join/${gameId}`, { method: "POST", headers });
    setCurrentGameId(gameId);
    socket.connect();
    socket.emit("join_game", { gameId });
  }

  async function roll() {
    if (!currentGameId || !user) return;
    const result = await api<{ move: { diceValue: number } }>("/api/game/move", {
      method: "POST",
      headers,
      body: JSON.stringify({ gameId: currentGameId }),
    });
    setDiceValue(result.move.diceValue);
  }

  return (
    <main className="p-6 flex flex-col gap-4 items-center">
      <h1 className="text-2xl font-semibold">Quest & Ladders</h1>
      {!user ? (
        <button onClick={demoLogin} className="px-3 py-2 rounded bg-cyan-600 hover:bg-cyan-500">Demo Login</button>
      ) : (
        <div className="flex gap-3 items-center">
          <span>Signed in as {user.username}</span>
        </div>
      )}

      <div className="flex gap-3 items-center">
        <button disabled={!user} onClick={createGame} className="px-3 py-2 rounded bg-emerald-600 disabled:opacity-50">Create Game</button>
        <input value={gameId} onChange={(e) => setGameId(e.target.value)} placeholder="Game ID" className="px-2 py-2 rounded bg-slate-800 border border-slate-700" />
        <button disabled={!user || !gameId} onClick={joinExisting} className="px-3 py-2 rounded bg-indigo-600 disabled:opacity-50">Join</button>
        <button disabled={!user || !currentGameId} onClick={roll} className="px-3 py-2 rounded bg-fuchsia-600 disabled:opacity-50">Roll Dice</button>
      </div>

      {diceValue !== null && <div className="text-slate-300">Last roll: {diceValue}</div>}

      <Board players={players} />

      {currentGameId && (
        <div className="text-xs text-slate-400">Game ID: {currentGameId}</div>
      )}
    </main>
  );
}