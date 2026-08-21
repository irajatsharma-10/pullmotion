import type { PRMovie } from "@/types/pr-movie";
import { ensureUniqueSceneIds } from "./scene-utils";

export interface SavedMovieItem extends PRMovie {
  savedAt: string;
}

const STORAGE_KEY = "prmovie_history";

export const LAST_ACTIVE_KEY = "prmovie_last_active_movie";

export function getSavedMovies(): SavedMovieItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? (parsed.map((m) => ensureUniqueSceneIds(m)) as SavedMovieItem[])
      : [];
  } catch {
    return [];
  }
}

export function getLastActiveMovie(): PRMovie | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LAST_ACTIVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.pr?.url && parsed?.movieId) return ensureUniqueSceneIds(parsed);
    }
    const saved = getSavedMovies();
    if (saved.length > 0) return ensureUniqueSceneIds(saved[0]);
    return null;
  } catch {
    return null;
  }
}

export function setLastActiveMovie(movie: PRMovie): void {
  if (typeof window === "undefined" || !movie?.movieId) return;
  try {
    const sanitized = ensureUniqueSceneIds(movie);
    localStorage.setItem(LAST_ACTIVE_KEY, JSON.stringify(sanitized));
  } catch {
    // ignore
  }
}

export function addSavedMovie(movie: PRMovie): SavedMovieItem[] {
  if (typeof window === "undefined" || !movie?.movieId) return [];
  try {
    const sanitizedMovie = ensureUniqueSceneIds(movie);
    const current = getSavedMovies();
    const existingIndex = current.findIndex(
      (m) => m.movieId === sanitizedMovie.movieId || m.sourceHash === sanitizedMovie.sourceHash
    );

    const newItem: SavedMovieItem = {
      ...sanitizedMovie,
      savedAt: new Date().toISOString(),
    };

    let updated: SavedMovieItem[];
    if (existingIndex >= 0) {
      updated = [newItem, ...current.filter((_, idx) => idx !== existingIndex)];
    } else {
      updated = [newItem, ...current].slice(0, 50); // Keep last 50 movies
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setLastActiveMovie(movie);
    window.dispatchEvent(new CustomEvent("prmovie_history_updated", { detail: updated }));
    return updated;
  } catch {
    return [];
  }
}

export function removeSavedMovie(movieId: string): SavedMovieItem[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getSavedMovies();
    const updated = current.filter((m) => m.movieId !== movieId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("prmovie_history_updated", { detail: updated }));
    return updated;
  } catch {
    return [];
  }
}

