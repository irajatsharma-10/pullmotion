"use client";

import { toast } from "sonner";
import React, { useState, useEffect, useMemo } from "react";
import { Film, Play, Pause, RotateCcw, Maximize2, Loader2, CheckCircle2, AlertCircle, FileText, Copy, Download } from "lucide-react";
import type { PRMovie } from "@/types/pr-movie";
import { SceneRenderer } from "@/components/movie/SceneRenderer";
import { EvidencePanel } from "@/components/movie/EvidencePanel";
import { MyMoviesModal } from "./MyMoviesModal";
import { ExamplesModal } from "./ExamplesModal";
import { PricingModal } from "./PricingModal";
import { SAMPLE_PR_MOVIE } from "@/lib/movie/fixture";
import { addSavedMovie, getLastActiveMovie, setLastActiveMovie } from "@/lib/movie/history";
import { ensureUniqueSceneIds } from "@/lib/movie/scene-utils";
import { themeColors, type AccentTheme } from "@/lib/studio-themes";
import { useMoviePlayback } from "@/hooks/useMoviePlayback";
import { useMovieGeneration } from "@/hooks/useMovieGeneration";
import { StudioTopbar } from "./StudioTopbar";
import { StudioSidebar } from "./StudioSidebar";
import { StudioTimeline } from "./StudioTimeline";
import { PresentationOverlay } from "./PresentationOverlay";
import { copyToClipboard } from "@/lib/utils";

interface StudioWorkspaceProps {
  initialMovie?: PRMovie;
}

export function StudioWorkspace({ initialMovie = SAMPLE_PR_MOVIE }: StudioWorkspaceProps) {
  const [movie, setMovie] = useState<PRMovie>(() => {
    if (typeof window !== "undefined" && initialMovie.pr.number === 49258) {
      const lastActive = getLastActiveMovie();
      if (lastActive && lastActive.pr?.url && lastActive.movieId) {
        return ensureUniqueSceneIds(lastActive);
      }
    }
    return ensureUniqueSceneIds(initialMovie);
  });

  const [prUrlInput, setPrUrlInput] = useState(() => movie.pr.url);
  const [movieTitle, setMovieTitle] = useState(() => movie.overview.title);
  const [accentTheme, setAccentTheme] = useState<AccentTheme>("purple");
  const [selectedDuration, setSelectedDuration] = useState<number>(() => movie.overview.totalDuration || 24);
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);

  const activeTheme = themeColors[accentTheme];

  const [activeTab, setActiveTab] = useState<"create" | "my-movies" | "examples" | "pricing">("create");
  const [isMyMoviesOpen, setIsMyMoviesOpen] = useState(false);
  const [isExamplesOpen, setIsExamplesOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  const totalDuration = selectedDuration;

  const {
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
  } = useMoviePlayback(movie, totalDuration, isPresentationMode, setIsPresentationMode);

  const switchActiveMovie = React.useCallback(
    (newMovie: PRMovie, updateUrl = true) => {
      const sanitized = ensureUniqueSceneIds(newMovie);
      setMovie(sanitized);
      setMovieTitle(sanitized.overview.title);
      setPrUrlInput(sanitized.pr.url);
      if (sanitized.overview.totalDuration) {
        setSelectedDuration(sanitized.overview.totalDuration);
      }
      setCurrentTime(0);
      setIsPlaying(false);
      addSavedMovie(newMovie);
      setLastActiveMovie(newMovie);

      if (updateUrl && typeof window !== "undefined") {
        try {
          const canonicalPath = `/${newMovie.pr.owner}/${newMovie.pr.repo}/pull/${newMovie.pr.number}`;
          window.history.replaceState(null, "", canonicalPath);
        } catch {
        }
      }
    },
    [setCurrentTime, setIsPlaying]
  );

  useEffect(() => {
    if (movie) {
      addSavedMovie(movie);
      setLastActiveMovie(movie);
    }
  }, [movie]);

  const {
    isGenerating,
    generationStep,
    statusMessage,
    isSuccessStatus,
    handleGenerateMovie,
  } = useMovieGeneration({ prUrlInput, setMovie, setMovieTitle, setSelectedDuration, setCurrentTime, setIsPlaying });

  const summaryScene = movie.scenes.find((s) => s.type === "summary");
  const summaryBullets = useMemo(() => {
    if (summaryScene?.bullets && summaryScene.bullets.length > 0) {
      return summaryScene.bullets;
    }
    return [
      { text: `Modifies ${movie.overview.stats.filesChanged} files in ${movie.pr.repo}.` },
      { text: `Includes +${movie.overview.stats.additions.toLocaleString()} additions and -${movie.overview.stats.deletions.toLocaleString()} deletions.` },
      { text: `Authored by @${movie.pr.author} with ${movie.overview.stats.commits} commits.` },
    ];
  }, [summaryScene, movie.overview.stats, movie.pr]);

  const handleCopySummary = async () => {
    const text = `${movie.overview.title}\n\n${movie.overview.summary}\n\nKey Changes:\n` +
      summaryBullets.map((b) => `• ${b.text}`).join("\n");
    const ok = await copyToClipboard(text);
    if (ok) {
      toast.success("AI Summary copied to clipboard");
    } else {
      toast.error("Failed to copy summary");
    }
  };

  const formatTime = (secs: number) => {
    const s = Math.max(0, Math.floor(secs));
    const m = Math.floor(s / 60);
    const remainder = s % 60;
    return `${m}:${remainder < 10 ? "0" : ""}${remainder}`;
  };

  return (
    <div
      data-accent-theme={accentTheme}
      className="min-h-screen bg-slate-50 dark:bg-[#06080e] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-purple-500 selection:text-white relative transition-colors duration-200"
    >
      <PresentationOverlay
        isPresentationMode={isPresentationMode}
        setIsPresentationMode={setIsPresentationMode}
        movie={movie}
        accentTheme={accentTheme}
        activeSceneIndex={activeSceneIndex}
        activeScene={activeScene}
        sceneOffsets={sceneOffsets}
        sceneProgress={sceneProgress}
        isPlaying={isPlaying}
        currentTime={currentTime}
        totalDuration={totalDuration}
        playbackSpeed={playbackSpeed}
        setPlaybackSpeed={setPlaybackSpeed}
        handlePlayPause={handlePlayPause}
        handleSeek={handleSeek}
      />

      <StudioTopbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setIsMyMoviesOpen={setIsMyMoviesOpen}
        setIsExamplesOpen={setIsExamplesOpen}
        setIsPricingOpen={setIsPricingOpen}
      />

      <main className="flex-1 w-full max-w-[1580px] mx-auto px-4 lg:px-6 py-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <StudioSidebar
          accentTheme={accentTheme}
          handlePlayPause={handlePlayPause}
          handleSeek={handleSeek}
          sceneOffsets={sceneOffsets}
        />

        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className={`flex items-center gap-2 p-1 rounded-xl bg-white dark:bg-[#101420] border border-slate-300 dark:border-white/10 shadow-xs focus-within:${activeTheme.border} focus-within:ring-2 focus-within:${activeTheme.ring}/20 transition-all`}>
              <div className={`p-1.5 ${activeTheme.text}`}>
                <Film className="w-4 h-4" />
              </div>
              <input
                id="pr-input"
                type="text"
                value={prUrlInput}
                onChange={(e) => setPrUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerateMovie()}
                placeholder="https://github.com/vercel/next.js/pull/49258"
                className="flex-1 bg-transparent px-2.5 py-1 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-mono"
              />
              <button
                onClick={handleGenerateMovie}
                disabled={isGenerating}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r ${activeTheme.primary} hover:opacity-90 text-white text-xs sm:text-sm font-bold shadow-lg ${activeTheme.glow} disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer active:scale-95`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Movie</span>
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-1.5 px-2 text-[11px] font-mono">
              {isGenerating ? (
                <span className={`${activeTheme.text} flex items-center gap-1.5`}>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>{generationStep || "Processing PR..."}</span>
                </span>
              ) : isSuccessStatus ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                  <span>{statusMessage}</span>
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0" />
                  <span>{statusMessage}</span>
                </span>
              )}
            </div>
          </div>

          <div className="relative w-full">
            <div className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-2xl relative overflow-hidden bg-[#06080e]">
              <div className="w-full flex flex-col overflow-hidden">
                <div className="px-3.5 py-2.5 flex items-center justify-between border-b border-slate-200 dark:border-white/10 text-xs bg-slate-50 dark:bg-[#0b0e17] select-none">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-mono text-slate-700 dark:text-slate-300">
                      <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? "bg-emerald-500 animate-ping" : activeTheme.accentBg}`} />
                      <span>{isPlaying ? "PLAYING" : "STUDIO 1080P"}</span>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center gap-2 text-slate-600 dark:text-slate-300 font-mono text-xs font-semibold">
                    <span className="text-slate-400">Scene {activeSceneIndex + 1}/{movie.scenes.length}:</span>
                    <span className={`${activeTheme.textLight} truncate max-w-xs`}>{activeScene.title || activeScene.type}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 bg-white dark:bg-white/5 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-white/10 truncate max-w-[200px]">
                      {movie.pr.owner}/{movie.pr.repo} #{movie.pr.number}
                    </span>
                  </div>
                </div>

                <div className="relative w-full aspect-video min-h-[400px] sm:min-h-[460px] md:min-h-[500px] bg-slate-900 dark:bg-[#07090e] flex items-center justify-center p-1 sm:p-2 overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center">
                    <SceneRenderer
                      scene={activeScene}
                      isActive={isPlaying}
                      progress={sceneProgress}
                      onSelectEvidence={setSelectedEvidenceId}
                      prUrl={movie.pr.url}
                    />
                  </div>

                  <EvidencePanel
                    evidence={movie.evidence || []}
                    selectedId={selectedEvidenceId}
                    onClose={() => setSelectedEvidenceId(null)}
                  />
                </div>

                <div className="w-full bg-slate-50 dark:bg-[#0a0d15] border-t border-slate-200 dark:border-white/10 px-4 py-2.5 flex flex-col gap-2 select-none">
                  <div
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                      handleSeek(ratio * totalDuration);
                    }}
                    className="w-full h-2 bg-slate-200 dark:bg-black/60 rounded-full relative cursor-pointer overflow-hidden"
                  >
                    <div
                      style={{ width: `${Math.min(100, (currentTime / totalDuration) * 100)}%` }}
                      className={`h-full bg-gradient-to-r ${activeTheme.primary} rounded-full`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 text-xs">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={handlePlayPause}
                        className={`p-2 rounded-xl bg-gradient-to-r ${activeTheme.primary} text-white shadow-md ${activeTheme.glow} hover:opacity-90 active:scale-95 transition-all cursor-pointer`}
                        title={isPlaying ? "Pause (Space)" : "Play (Space)"}
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      </button>

                      <button
                        onClick={() => handleSeek(0)}
                        className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        title="Restart"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 text-xs ml-1">
                        {formatTime(currentTime)} / {formatTime(totalDuration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const nextSpeed = playbackSpeed === 1 ? 1.5 : playbackSpeed === 1.5 ? 2 : 1;
                          setPlaybackSpeed(nextSpeed);
                        }}
                        className="px-2.5 py-1 bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/15 rounded-lg text-slate-700 dark:text-slate-200 font-mono text-[11px] font-bold border border-slate-200 dark:border-white/10 transition-colors cursor-pointer shadow-xs"
                      >
                        {playbackSpeed}x
                      </button>

                      <button
                        onClick={() => setIsPresentationMode(true)}
                        className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        title="Open Presentation Mode"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <StudioTimeline
            movie={movie}
            setMovie={setMovie}
            movieTitle={movieTitle}
            setMovieTitle={setMovieTitle}
            accentTheme={accentTheme}
            setAccentTheme={setAccentTheme}
            selectedDuration={selectedDuration}
            setSelectedDuration={setSelectedDuration}
            totalDuration={totalDuration}
            handleSeek={handleSeek}
            activeSceneIndex={activeSceneIndex}
            sceneOffsets={sceneOffsets}
          />
        </div>

        <div className="lg:col-span-3 flex flex-col gap-3">
          <div className="p-4 rounded-xl bg-white dark:bg-[#0e121c] border border-slate-200 dark:border-white/10 shadow-xs flex flex-col gap-2.5 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>AI Summary</span>
                <FileText className={`w-3.5 h-3.5 ${activeTheme.text}`} />
              </h3>
            </div>

            <div className="max-h-60 sm:max-h-72 overflow-y-auto pr-1 flex flex-col gap-2.5 scrollbar-thin">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {movie.overview.summary}
              </p>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-600 dark:text-slate-300">
                {summaryBullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{bullet.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleCopySummary}
              className={`mt-1 w-full py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-white/10 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer hover:${activeTheme.text}`}
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Summary</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#0e121c] border border-slate-200 dark:border-white/10 shadow-xs flex flex-col gap-2.5 transition-colors">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              PR Stats
            </h3>

            <div className="grid grid-cols-3 gap-2 font-mono">
              <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 flex flex-col items-center">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  +{movie.overview.stats.additions.toLocaleString()}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Additions</span>
              </div>

              <div className="p-1.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200/80 dark:border-white/5 flex flex-col items-center">
                <span className="text-rose-600 dark:text-rose-400 font-bold text-xs">
                  -{movie.overview.stats.deletions.toLocaleString()}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Deletions</span>
              </div>

              <div className="p-1.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200/80 dark:border-white/5 flex flex-col items-center">
                <span className="text-sky-600 dark:text-sky-400 font-bold text-xs">
                  {movie.overview.stats.filesChanged}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Files</span>
              </div>

              <div className="p-1.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200/80 dark:border-white/5 flex flex-col items-center">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                  {movie.overview.stats.commits}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Commits</span>
              </div>

              <div className="p-1.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200/80 dark:border-white/5 flex flex-col items-center">
                <span className={`${activeTheme.text} font-bold text-xs truncate max-w-full`}>
                  @{movie.pr.author}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Author</span>
              </div>

              <div className="p-1.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200/80 dark:border-white/5 flex flex-col items-center">
                <span className="text-amber-600 dark:text-amber-400 font-bold text-xs truncate">
                  #{movie.pr.number}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400">PR Number</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#0e121c] border border-slate-200 dark:border-white/10 shadow-xs flex flex-col gap-2 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                Export Movie
              </h3>
              <span className={`text-[10px] ${activeTheme.text} font-medium font-mono`}>
                V2 Feature
              </span>
            </div>

            <div className="w-full py-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 text-xs font-medium border border-slate-200 dark:border-white/5 flex items-center justify-between cursor-not-allowed">
              <div className="flex items-center gap-2">
                <Download className="w-3.5 h-3.5" />
                <span>Download MP4 (1080p)</span>
              </div>
              <span className="text-[9px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-white/10 text-slate-600 dark:text-slate-400">
                Soon
              </span>
            </div>

            <div className="w-full py-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 text-xs font-medium border border-slate-200 dark:border-white/5 flex items-center justify-between cursor-not-allowed">
              <div className="flex items-center gap-2">
                <Film className="w-3.5 h-3.5" />
                <span>Download GIF</span>
              </div>
              <span className="text-[9px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-white/10 text-slate-600 dark:text-slate-400">
                Soon
              </span>
            </div>

            <div className="w-full py-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 text-xs font-medium border border-slate-200 dark:border-white/5 flex items-center justify-between cursor-not-allowed">
              <div className="flex items-center gap-2">
                <Download className="w-3.5 h-3.5" />
                <span>Download WebM</span>
              </div>
              <span className="text-[9px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-white/10 text-slate-600 dark:text-slate-400">
                Soon
              </span>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full px-6 py-2.5 border-t border-slate-200 dark:border-white/5 bg-slate-50/80 dark:bg-transparent flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 dark:text-slate-500 gap-2 transition-colors">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>PR Movie Studio</span>
          </div>
          <span>•</span>
          <span>Deterministic Pull Request Explanations</span>
        </div>
        <div>
          <span>Next.js 16, React 19, Motion & Prisma 8</span>
        </div>
      </footer>

      <MyMoviesModal
        isOpen={isMyMoviesOpen}
        onClose={() => {
          setIsMyMoviesOpen(false);
          setActiveTab("create");
        }}
        onSelectMovie={(m) => {
          switchActiveMovie(m, true);
          toast.success(`Loaded PR Movie story for ${m.pr.repo} #${m.pr.number}`);
        }}
        currentMovie={movie}
      />

      <ExamplesModal
        isOpen={isExamplesOpen}
        onClose={() => {
          setIsExamplesOpen(false);
          setActiveTab("create");
        }}
        onSelectExample={(m) => {
          switchActiveMovie(m, true);
          toast.success(`Loaded example: ${m.pr.repo} #${m.pr.number}`);
        }}
      />

      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => {
          setIsPricingOpen(false);
          setActiveTab("create");
        }}
      />
    </div>
  );
}
