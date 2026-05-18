import { useCallback, useEffect, useState } from "react";
import { useI18n } from "../../../i18n";
import { createTeacherGame, deleteTeacherGame, fetchTeacherGames } from "../api";
import { teacherOwnerId } from "../constants";
import type { GameInstance } from "../types";

export function useTeacherDashboard() {
  const { t } = useI18n();
  const [games, setGames] = useState<GameInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const fetchGames = useCallback(async () => {
    try {
      const nextGames = await fetchTeacherGames(teacherOwnerId);
      setGames(nextGames);
    } catch (err) {
      setError(t("error.loadGames"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  async function createGame() {
    const nextGameNumber = games.length + 1;
    setCreating(true);
    setError("");

    try {
      await createTeacherGame({
        name: t("teacherDashboard.defaultGameName", { number: nextGameNumber }),
        ownerId: teacherOwnerId,
      });
      await fetchGames();
    } catch (err) {
      setError(t("error.createGame"));
      console.error(err);
    } finally {
      setCreating(false);
    }
  }

  async function deleteGame(gameId: string) {
    try {
      await deleteTeacherGame(gameId);
      await fetchGames();
    } catch (err) {
      setError(t("error.deleteGame"));
      console.error(err);
    }
  }

  return {
    games,
    loading,
    creating,
    error,
    createGame,
    deleteGame,
  };
}
