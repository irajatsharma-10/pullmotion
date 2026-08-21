import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type { PRMovie } from "@/types/pr-movie";

export type SceneOffset = { start: number; end: number; duration: number };

export function useMoviePlayback(
  movie: PRMovie,
  totalDuration: number,
  isPresentationMode: boolean,
  setIsPresentationMode: React.Dispatch<React.SetStateAction<boolean>>
) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeedState] = useState<1 | 1.5 | 2>(1);

  // Sync mutable refs to prevent stale closure race conditions in requestAnimationFrame loop
  const playbackSpeedRef = useRef<number>(playbackSpeed);
  useEffect(() => {
    playbackSpeedRef.current = playbackSpeed;
  }, [playbackSpeed]);

  const totalDurationRef = useRef<number>(totalDuration);
  useEffect(() => {
    totalDurationRef.current = totalDuration;
  }, [totalDuration]);

  // Strictly typed speed setter wrapper
  const setPlaybackSpeed = useCallback((speed: 1 | 1.5 | 2) => {
    setPlaybackSpeedState(speed);
  }, []);

  // Compute scene time offsets immutably
  const sceneOffsets = useMemo(() => {
    const rawTotal = movie.scenes.reduce((acc, s) => acc + (s.duration || 4), 0) || 1;
    const safeTotalDuration = Math.max(1, totalDuration);
    const ratio = safeTotalDuration / rawTotal;

    return movie.scenes.reduce<Array<SceneOffset>>((acc, scene) => {
      const duration = (scene.duration || 4) * ratio;
      const start = acc.length > 0 ? acc[acc.length - 1].end : 0;
      const end = start + duration;
      acc.push({ start, end, duration });
      return acc;
    }, []);
  }, [movie.scenes, totalDuration]);

  // Find active scene index & progress
  const activeSceneIndex = useMemo(() => {
    const idx = sceneOffsets.findIndex(
      (offset) => currentTime >= offset.start && currentTime < offset.end
    );
    return idx === -1 ? Math.max(0, movie.scenes.length - 1) : idx;
  }, [currentTime, sceneOffsets, movie.scenes.length]);

  const activeScene = movie.scenes[activeSceneIndex] || movie.scenes[0];
  const activeOffset = sceneOffsets[activeSceneIndex];
  const sceneProgress = activeOffset
    ? Math.min(1, Math.max(0, (currentTime - activeOffset.start) / Math.max(0.001, activeOffset.duration)))
    : 0;

  // Playback Loop via requestAnimationFrame with ref-based speed and duration
  useEffect(() => {
    if (!isPlaying) return;

    let animationFrameId: number;
    let lastTimestamp = performance.now();

    const tick = (now: number) => {
      const deltaSeconds = ((now - lastTimestamp) / 1000) * playbackSpeedRef.current;
      lastTimestamp = now;

      setCurrentTime((prev) => {
        const next = prev + deltaSeconds;
        const currentLimit = totalDurationRef.current;
        if (next >= currentLimit) {
          setIsPlaying(false);
          return currentLimit;
        }
        return next;
      });

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying]);

  // Spacebar and Arrow key controls without stale currentTime closure
  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => {
      if (!prev) {
        setCurrentTime((t) => (t >= totalDurationRef.current ? 0 : t));
      }
      return !prev;
    });
  }, []);

  const handleSeek = useCallback((time: number) => {
    setCurrentTime(Math.max(0, Math.min(totalDurationRef.current, time)));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        setCurrentTime((prev) => Math.max(0, prev - 5));
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        setCurrentTime((prev) => Math.min(totalDurationRef.current, prev + 5));
      } else if (e.code === "Escape") {
        if (isPresentationMode) {
          e.preventDefault();
          setIsPresentationMode(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePlayPause, isPresentationMode, setIsPresentationMode]);

  return {
    isPlaying,
    currentTime,
    playbackSpeed,
    setPlaybackSpeed,
    sceneOffsets,
    activeSceneIndex,
    activeScene,
    sceneProgress,
    handlePlayPause,
    handleSeek,
    setCurrentTime,
    setIsPlaying,
  };
}
