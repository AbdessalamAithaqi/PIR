import { useCallback, useEffect, useState } from "react";
import type { DragEvent } from "react";
import {
  assignStudentRequest,
  fetchGameDetails,
  saveParametersRequest,
  unassignStudentRequest,
  updateRoundRequest,
} from "../api";
import { defaultParameters } from "../constants";
import type { GameDetails, GameParameters, RoundAction, TeacherTab } from "../types";
import { sanitizeParameters } from "../utils";

const STUDENT_DRAG_MIME_TYPE = "application/x-student-id";

export function useTeacherGame(gameId: string | undefined) {
  const [activeTab, setActiveTab] = useState<TeacherTab>("teams");
  const [details, setDetails] = useState<GameDetails | null>(null);
  const [parameters, setParameters] = useState<GameParameters>(defaultParameters);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchGame = useCallback(async () => {
    if (!gameId) return;

    try {
      const data = await fetchGameDetails(gameId);
      setDetails(data);
      if (data?.parameters) setParameters(sanitizeParameters(data.parameters));
      setError("");
    } catch (err) {
      setError("Failed to load game");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchGame();
  }, [fetchGame]);

  async function assignStudent(studentId: string, teamId: string) {
    if (!gameId) return;

    setSaving(true);
    try {
      await assignStudentRequest({ gameId, teamId, studentId });
      await fetchGame();
    } catch (err) {
      setError("Failed to assign student");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function unassignStudent(studentId: string) {
    if (!gameId) return;

    setSaving(true);
    try {
      await unassignStudentRequest({ gameId, studentId });
      await fetchGame();
    } catch (err) {
      setError("Failed to unassign student");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function updateRound(action: RoundAction) {
    if (!gameId) return;

    setSaving(true);
    try {
      await updateRoundRequest({ gameId, action });
      await fetchGame();
    } catch (err) {
      setError("Failed to update round");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function saveParameters(nextParameters: GameParameters) {
    if (!gameId) return;

    const safeParameters = sanitizeParameters(nextParameters);
    setSaving(true);
    try {
      const savedParameters = await saveParametersRequest({ gameId, parameters: safeParameters });
      if (savedParameters) setParameters(sanitizeParameters(savedParameters));
      await fetchGame();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save parameters");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  function getDraggedStudentId(event: DragEvent) {
    return event.dataTransfer.getData(STUDENT_DRAG_MIME_TYPE);
  }

  function startStudentDrag(event: DragEvent, studentId: string) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(STUDENT_DRAG_MIME_TYPE, studentId);
  }

  return {
    activeTab,
    setActiveTab,
    details,
    parameters,
    setParameters,
    loading,
    saving,
    error,
    assignStudent,
    unassignStudent,
    updateRound,
    saveParameters,
    getDraggedStudentId,
    startStudentDrag,
  };
}
