import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Film, ShieldCheck, X, Minimize2, Pause, Play, RotateCcw, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import type { PRMovie } from "@/types/pr-movie";
import type { Scene } from "@/types/scenes";
import type { SceneOffset } from "@/hooks/useMoviePlayback";
import { SceneRenderer } from "@/components/movie/SceneRenderer";
import { EvidencePanel } from "@/components/movie/EvidencePanel";
import { themeColors, type AccentTheme } from "@/lib/studio-themes";

interface PresentationOverlayProps {
  isPresentationMode: boolean;
  setIsPresentationMode: (val: boolean) => void;
  movie: PRMovie;
  accentTheme: AccentTheme;
  activeSceneIndex: number;
  activeScene: Scene;
  sceneOffsets: SceneOffset[];
  sceneProgress: number;
  isPlaying: boolean;
  currentTime: number;
  totalDuration: number;
  playbackSpeed: number;
  setPlaybackSpeed: (val: 1 | 1.5 | 2) => void;
  handlePlayPause: () => void;
  handleSeek: (time: number) => void;
}

export function PresentationOverlay({
  isPresentationMode,
  setIsPresentationMode,
  movie,
  accentTheme,
  activeSceneIndex,
  activeScene,
  sceneOffsets,
  sceneProgress,
  isPlaying,
  currentTime,
  totalDuration,
  playbackSpeed,
  setPlaybackSpeed,
  handlePlayPause,
  handleSeek,
}: PresentationOverlayProps) {
  const [selectedEvidenceId, setSelectedEvidenceId] = React.useState<string | null>(null);
  const activeTheme = themeColors[accentTheme];

  React.useEffect(() => {
    if (isPresentationMode) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [isPresentationMode]);

  const formatTime = (secs: number) => {
    const s = Math.max(0, Math.floor(secs));
    const m = Math.floor(s / 60);
    const remainder = s % 60;
    return `${m}:${remainder < 10 ? "0" : ""}${remainder}`;
  };

  const handleTogglePresentation = () => setIsPresentationMode(false);

  const handlePrevScene = () => {
    if (activeSceneIndex > 0) {
      const prevOffset = sceneOffsets[activeSceneIndex - 1];
      if (prevOffset) handleSeek(prevOffset.start);
    } else {
      handleSeek(0);
    }
  };

  const handleNextScene = () => {
    if (activeSceneIndex < movie.scenes.length - 1) {
      const nextOffset = sceneOffsets[activeSceneIndex + 1];
      if (nextOffset) handleSeek(nextOffset.start);
    }
  };

  const getSceneShortLabel = (scene?: Scene, idx: number = 0) => {
    if (!scene) return `Stage ${idx + 1}`;
    switch (scene.type) {
      case "overview": return "Overview";
      case "before_after": return "Architecture";
      case "code_changes": return "Code Changes";
      case "change_breakdown": return "Breakdown";
      case "files_changed": return "Files";
      case "summary": return "Summary";
      default: return `Stage ${idx + 1}`;
    }
  };

  const prUrl = movie.pr.url || `https://github.com/${movie.pr.owner}/${movie.pr.repo}/pull/${movie.pr.number}`;

  return (
    <AnimatePresence>
      {isPresentationMode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.99 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-[#06080e] flex flex-col justify-between p-3 sm:p-5 select-none overflow-hidden h-screen w-screen max-h-screen max-w-screen"
        >
          <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-[#0a0d15]/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shrink-0 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`p-2 rounded-xl bg-gradient-to-r ${activeTheme.primary} text-white shadow-lg ${activeTheme.glow} shrink-0`}
              >
                <Film className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate max-w-md">
                  {movie.overview.title}
                </h2>
                <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono text-slate-400">
                  <a
                    href={prUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-300 inline-flex items-center gap-1.5 transition-colors group cursor-pointer"
                    title="Open PR on GitHub"
                  >
                    <span className="truncate group-hover:underline">
                      {movie.pr.owner}/{movie.pr.repo} #{movie.pr.number} by @{movie.pr.author}
                    </span>
                    <ExternalLink className="w-3 h-3 text-indigo-400 group-hover:text-indigo-300 shrink-0" />
                  </a>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 font-mono text-xs font-semibold text-slate-200">
              <span className="text-indigo-400">Stage {activeSceneIndex + 1}/{movie.scenes.length}:</span>
              <span className="truncate max-w-xs font-sans text-white">{activeScene.title || activeScene.type}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {movie.evidence && movie.evidence.length > 0 && (
                <button
                  onClick={() => setSelectedEvidenceId(selectedEvidenceId ? null : movie.evidence![0].id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
                    selectedEvidenceId
                      ? "bg-indigo-500/25 text-indigo-300 border-indigo-500/40"
                      : "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Evidence ({movie.evidence.length})</span>
                </button>
              )}

              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                <button
                  onClick={handleTogglePresentation}
                  className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                  title="Close Fullscreen Review Mode (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={handleTogglePresentation}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 transition-colors cursor-pointer"
                  title="Exit Fullscreen"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="relative flex-1 w-full max-w-6xl mx-auto flex items-center justify-center p-2 sm:p-4 my-auto overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <SceneRenderer
                scene={activeScene}
                isActive={isPlaying}
                progress={sceneProgress}
                onSelectEvidence={setSelectedEvidenceId}
                prUrl={prUrl}
              />
            </div>

            <EvidencePanel
              evidence={movie.evidence || []}
              selectedId={selectedEvidenceId}
              onClose={() => setSelectedEvidenceId(null)}
            />
          </div>

          <div className="w-full max-w-5xl mx-auto bg-[#0a0d15]/95 backdrop-blur-2xl border border-white/10 rounded-2xl px-4 sm:px-6 py-3 flex flex-col gap-2.5 shadow-2xl shrink-0">
            <div className="flex gap-1.5 w-full h-2.5 bg-black/60 rounded-full p-0.5 overflow-hidden cursor-pointer">
              {sceneOffsets.map((offset, idx) => {
                const isPast = currentTime >= offset.end;
                const isCurrent = currentTime >= offset.start && currentTime < offset.end;
                const progressPercent = isPast
                  ? 100
                  : isCurrent
                  ? ((currentTime - offset.start) / Math.max(0.001, offset.duration)) * 100
                  : 0;
                const widthWeight = (offset.duration / (totalDuration || 1)) * 100;
                const scene = movie.scenes[idx];
                const label = getSceneShortLabel(scene, idx);

                return (
                  <div
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                      handleSeek(offset.start + ratio * offset.duration);
                    }}
                    style={{ width: `${widthWeight}%` }}
                    className="h-full bg-white/10 rounded-full cursor-pointer relative overflow-hidden group hover:bg-white/25 transition-all min-w-[6px]"
                    title={`Jump to Stage ${idx + 1}: ${scene?.title || label} (${formatTime(offset.start)} - ${formatTime(offset.end)})`}
                  >
                    <div
                      style={{ width: `${progressPercent}%` }}
                      className={`h-full bg-gradient-to-r ${activeTheme.primary} rounded-full transition-[width] duration-75`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300 gap-3">
              <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                <button
                  onClick={handlePrevScene}
                  disabled={activeSceneIndex === 0 && currentTime === 0}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  title="Previous Review Stage (←)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={handlePlayPause}
                  className={`p-2 rounded-xl ${activeTheme.accentBg} text-white shadow-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer`}
                  title={isPlaying ? "Pause (Space)" : "Play (Space)"}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                </button>

                <button
                  onClick={handleNextScene}
                  disabled={activeSceneIndex === movie.scenes.length - 1}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  title="Next Review Stage (→)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleSeek(0)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  title="Restart"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <span className="font-mono text-xs text-slate-300 font-semibold ml-1">
                  {formatTime(currentTime)} / {formatTime(totalDuration)}
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 max-w-full overflow-x-auto scrollbar-none">
                {movie.scenes.map((s, idx) => {
                  const isSelected = activeSceneIndex === idx;
                  const offset = sceneOffsets[idx];
                  const shortLabel = getSceneShortLabel(s, idx);
                  const hasManyScenes = movie.scenes.length > 5;

                  return (
                    <button
                      key={`${s.id || s.type}-${idx}`}
                      onClick={() => offset && handleSeek(offset.start)}
                      className={`rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                        isSelected
                          ? `${activeTheme.accentBg} text-white shadow-md px-3 py-1`
                          : hasManyScenes
                          ? "w-7 h-6 text-slate-400 hover:text-white hover:bg-white/10 text-[11px] font-mono"
                          : "px-2.5 py-1 text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                      title={`Stage ${idx + 1}: ${s.title || shortLabel} (${offset ? `${formatTime(offset.start)} - ${formatTime(offset.end)}` : ""})`}
                    >
                      {isSelected ? (
                        <span className="flex items-center gap-1">
                          <span>Stage {idx + 1}</span>
                          <span className="text-white/80 font-normal hidden lg:inline">• {shortLabel}</span>
                        </span>
                      ) : hasManyScenes ? (
                        <span>{idx + 1}</span>
                      ) : (
                        <span>{shortLabel}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    const nextSpeed = playbackSpeed === 1 ? 1.5 : playbackSpeed === 1.5 ? 2 : 1;
                    setPlaybackSpeed(nextSpeed);
                  }}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/15 rounded-lg text-slate-200 font-mono text-[11px] font-bold border border-white/10 transition-colors cursor-pointer"
                  title="Playback Speed"
                >
                  {playbackSpeed}x
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
