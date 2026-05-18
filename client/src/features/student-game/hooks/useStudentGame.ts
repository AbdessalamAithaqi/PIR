import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useI18n } from "../../../i18n";
import {
  fetchAssignment,
  fetchGameDetails,
  joinGameRequest,
  submitBidRequest,
  submitLineupRequest,
  submitMarketingRequest,
  submitReadyRequest,
} from "../api";
import { benchPlayers, JOINED_GAME_STORAGE_KEY, startingPlayers } from "../constants";
import type { GameDetails, GameSummary, Player, StudentScreen, StudentTab, TeamSummary } from "../types";
import { buildStandings, getDemoStudentId, isStarter, splitRoster, toPlayer } from "../utils";

export function useStudentGame() {
  const { t } = useI18n();
  const [screen, setScreen] = useState<StudentScreen>("join");
  const [activeTab, setActiveTab] = useState<StudentTab>("team");
  const [joinCode, setJoinCode] = useState("");
  const [game, setGame] = useState<GameSummary | null>(null);
  const [gameDetails, setGameDetails] = useState<GameDetails | null>(null);
  const [team, setTeam] = useState<TeamSummary | null>(null);
  const [lineup, setLineup] = useState<Player[]>(startingPlayers);
  const [bench, setBench] = useState<Player[]>(benchPlayers);
  const [selectedLineupId, setSelectedLineupId] = useState<string | null>(null);
  const [bids, setBids] = useState<Record<string, number>>({});
  const [marketingSpend, setMarketingSpend] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(false);
  const [studentId] = useState(getDemoStudentId);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const leaveGame = useCallback(() => {
    window.localStorage.removeItem(JOINED_GAME_STORAGE_KEY);
    setScreen("join");
    setActiveTab("team");
    setJoinCode("");
    setGame(null);
    setGameDetails(null);
    setTeam(null);
    setLineup(startingPlayers);
    setBench(benchPlayers);
    setSelectedLineupId(null);
    setBids({});
    setMarketingSpend({});
    setReady(false);
    setRefreshing(false);
    setError("");
  }, []);

  useEffect(() => {
    const storedGame = window.localStorage.getItem(JOINED_GAME_STORAGE_KEY);
    if (!storedGame) return;

    try {
      const parsedGame = JSON.parse(storedGame) as GameSummary;
      setGame(parsedGame);
      setScreen("waiting");
    } catch {
      window.localStorage.removeItem(JOINED_GAME_STORAGE_KEY);
    }
  }, []);

  const loadGameDetails = useCallback(async (gameId: string) => {
    const data = await fetchGameDetails(gameId);
    if (data) {
      setGameDetails(data);
    }
    return data;
  }, []);

  const replaceRosterFromTeam = useCallback((updatedTeam: TeamSummary) => {
    const { starters, bench: reserves } = splitRoster(updatedTeam.roster);
    if (starters.length > 0) {
      setLineup(starters);
      setBench(reserves);
    }
  }, []);

  const mergeRosterFromTeam = useCallback(
    (updatedTeam: TeamSummary) => {
      const roster = (updatedTeam.roster ?? []).map(toPlayer);
      if (roster.length === 0) return;

      const rosterById = new Map(roster.map((player) => [player.id, player]));
      const knownIds = new Set([...lineup, ...bench].map((player) => player.id));
      const wonPlayers = roster.filter((player) => !knownIds.has(player.id) && !isStarter(player));

      setLineup((players) => players.map((player) => rosterById.get(player.id) ?? player));
      setBench((players) => [
        ...players.map((player) => rosterById.get(player.id) ?? player),
        ...wonPlayers,
      ]);
    },
    [bench, lineup],
  );

  async function joinGame(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedJoinCode = joinCode.trim().toUpperCase();

    if (!trimmedJoinCode) {
      setError(t("error.joinCodeRequired"));
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const joinedGame = await joinGameRequest({
        joinCode: trimmedJoinCode,
        studentId,
        studentName: "Demo Student",
      });

      setGame(joinedGame);
      window.localStorage.setItem(JOINED_GAME_STORAGE_KEY, JSON.stringify(joinedGame));
      setScreen("waiting");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error.joinFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (screen !== "waiting" || !game) return;

    let active = true;
    const gameId = game.id;

    async function checkAssignment() {
      try {
        const data = await fetchAssignment(gameId, studentId);
        if (!data) return;

        if (active && data.assigned && data.team) {
          const details = await loadGameDetails(gameId);
          const assignedTeam = details?.teams.find((candidate) => candidate.id === data.team?.id) ?? data.team;
          setTeam(assignedTeam);
          replaceRosterFromTeam(assignedTeam);
          setReady(Boolean(assignedTeam.ready));
          setScreen("dashboard");
        }
      } catch (err) {
        console.error("Failed to check assignment:", err);
      }
    }

    checkAssignment();
    const intervalId = window.setInterval(checkAssignment, 3000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [game, loadGameDetails, replaceRosterFromTeam, screen, studentId]);

  const swapPlayer = useCallback(
    (benchPlayer: Player) => {
      if (!selectedLineupId) return;

      const selectedPlayer = lineup.find((player) => player.id === selectedLineupId);
      if (!selectedPlayer) return;

      setLineup((players) =>
        players.map((player) => (player.id === selectedLineupId ? benchPlayer : player)),
      );
      setBench((players) =>
        players.map((player) => (player.id === benchPlayer.id ? selectedPlayer : player)),
      );
      setSelectedLineupId(null);
      setReady(false);
    },
    [lineup, selectedLineupId],
  );

  const refreshDashboard = useCallback(async () => {
    if (!game || !team) return;
    setRefreshing(true);
    try {
      const details = await loadGameDetails(game.id);
      const updatedTeam = details?.teams.find((candidate) => candidate.id === team.id);
      if (updatedTeam) {
        setTeam(updatedTeam);
        setReady(Boolean(updatedTeam.ready));
        mergeRosterFromTeam(updatedTeam);
      }
    } finally {
      setRefreshing(false);
    }
  }, [game, loadGameDetails, mergeRosterFromTeam, team]);

  useEffect(() => {
    if (screen !== "dashboard" || !game) return;

    const intervalId = window.setInterval(() => {
      refreshDashboard();
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [game, refreshDashboard, screen]);

  function isDecisionPhaseOpen() {
    return gameDetails?.game.status === "ACTIVE";
  }

  async function submitBid(playerId: string, amount: number) {
    if (!game || !team) return;
    if (!isDecisionPhaseOpen()) {
      setError(t("error.roundClosed"));
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError(t("error.positiveBid"));
      return;
    }

    setError("");
    try {
      await submitBidRequest({
        gameId: game.id,
        teamId: team.id,
        playerId,
        amount,
      });
      setBids((currentBids) => ({ ...currentBids, [playerId]: amount }));
      await refreshDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error.placeBid"));
    }
  }

  async function submitMarketing(spend: Record<string, number>) {
    if (!game || !team) return false;
    if (!isDecisionPhaseOpen()) {
      setError(t("error.roundClosed"));
      return false;
    }
    setError("");
    const pubInvestment = ["campus", "social"].filter((id) => (spend[id] ?? 0) > 0).length;
    const merchInvestment = ["merch", "sponsor", "family"].filter((id) => (spend[id] ?? 0) > 0).length;

    try {
      await submitMarketingRequest({
        gameId: game.id,
        teamId: team.id,
        pubInvestment,
        merchInvestment,
      });
      await refreshDashboard();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error.saveMarketing"));
      return false;
    }
  }

  async function markReady() {
    if (!game || !team) return;
    if (!isDecisionPhaseOpen()) {
      setError(t("error.roundClosed"));
      return;
    }
    setError("");

    try {
      await submitLineupRequest({
        gameId: game.id,
        teamId: team.id,
        starterPlayerIds: lineup.map((player) => player.id),
      });

      const marketingSaved = await submitMarketing(marketingSpend);
      if (!marketingSaved) return;

      await submitReadyRequest({ gameId: game.id, teamId: team.id });
      setReady(true);
      await refreshDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error.markReady"));
    }
  }

  const standings = useMemo(() => buildStandings(gameDetails), [gameDetails]);
  const totalReserved = Object.values(bids).reduce((sum, bid) => sum + bid, 0);
  const totalMarketing = Object.values(marketingSpend).reduce((sum, spend) => sum + spend, 0);

  return {
    screen,
    activeTab,
    setActiveTab,
    joinCode,
    setJoinCode,
    game,
    currentGame: gameDetails?.game ?? game,
    gameDetails,
    team,
    lineup,
    bench,
    selectedLineupId,
    setSelectedLineupId,
    swapPlayer,
    bids,
    setBids,
    marketingSpend,
    setMarketingSpend,
    ready,
    submitting,
    refreshing,
    error,
    setError,
    leaveGame,
    joinGame,
    submitBid,
    submitMarketing,
    markReady,
    refreshDashboard,
    standings,
    totalReserved,
    totalMarketing,
    decisionOpen: (gameDetails?.game ?? game)?.status === "ACTIVE",
  };
}
