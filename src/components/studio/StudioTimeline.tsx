"use client";

import React from "react";
import { Check, ChevronDown } from "lucide-react";
import type { PRMovie } from "@/types/pr-movie";
import { themeColors, type AccentTheme } from "@/lib/studio-themes";
import type { SceneOffset } from "@/hooks/useMoviePlayback";

interface StudioTimelineProps {
  movie: PRMovie;
  setMovie: React.Dispatch<React.SetStateAction<PRMovie>>;
  movieTitle: string;
  setMovieTitle: (title: string) => void;
  accentTheme: AccentTheme;
  setAccentTheme: (theme: AccentTheme) => void;
  selectedDuration: number;
  setSelectedDuration: (dur: number) => void;
  totalDuration: number;
  handleSeek: (time: number) => void;
  activeSceneIndex: number;
  sceneOffsets: SceneOffset[];
}

export function StudioTimeline({
  movie,
  setMovie,
  movieTitle,
  setMovieTitle,
  accentTheme,
  setAccentTheme,
  selectedDuration,
  setSelectedDuration,
  totalDuration,
  handleSeek,
  activeSceneIndex,
  sceneOffsets,
}: StudioTimelineProps) {
  const activeTheme = themeColors[accentTheme];

  const getSceneLabel = (type: string, idx: number) => {
    switch (type) {
      case "overview": return `${idx + 1}. Overview`;
      case "before_after": return `${idx + 1}. Architecture`;
      case "code_changes": return `${idx + 1}. Code Changes`;
      case "change_breakdown": return `${idx + 1}. Breakdown`;
      case "files_changed": return `${idx + 1}. Files`;
      case "summary": return `${idx + 1}. Summary`;
      default: return `${idx + 1}. Scene`;
    }
  };

  const durationOptions = React.useMemo(() => {
    const naturalDuration = movie.overview.totalDuration || movie.scenes.reduce((sum, s) => sum + (s.duration || 5), 0) || 24;
    const quickDuration = Math.max(10, Math.round(movie.scenes.length * 2.5));
    const standardDuration = Math.max(20, Math.round(movie.scenes.length * 4.5));
    const deepDiveDuration = Math.max(30, Math.round(movie.scenes.length * 6.5));

    const options: Array<{ label: string; value: number }> = [
      { label: `Auto (${naturalDuration}s • Natural)`, value: naturalDuration },
    ];

    if (quickDuration !== naturalDuration) {
      options.push({ label: `Quick (${quickDuration}s)`, value: quickDuration });
    }
    if (standardDuration !== naturalDuration && standardDuration !== quickDuration) {
      options.push({ label: `Standard (${standardDuration}s)`, value: standardDuration });
    }
    if (deepDiveDuration !== naturalDuration && deepDiveDuration !== standardDuration && deepDiveDuration !== quickDuration) {
      options.push({ label: `Deep Dive (${deepDiveDuration}s)`, value: deepDiveDuration });
    }

    if (!options.some((opt) => opt.value === selectedDuration)) {
      options.push({ label: `Custom (${selectedDuration}s)`, value: selectedDuration });
    }

    return options;
  }, [movie.overview.totalDuration, movie.scenes, selectedDuration]);

  return (
    <div className="w-full flex flex-col gap-3 mt-1">
      <div className="flex items-center justify-between px-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
            Storyboard Scenes
          </span>
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-200/80 dark:bg-white/5 px-2 py-0.5 rounded-full border border-slate-200 dark:border-white/10">
            {movie.scenes.length} scenes • {totalDuration}s
          </span>
        </div>
        <span className={`text-[11px] font-mono ${activeTheme.text} font-semibold hidden sm:inline`}>
          Click any scene to jump
        </span>
      </div>

      <div className="w-full overflow-x-auto pb-1 scrollbar-none">
        <div
          className={`gap-2 min-w-full ${
            movie.scenes.length <= 3
              ? "flex flex-wrap sm:flex-nowrap"
              : "grid grid-cols-2 sm:grid-cols-3 md:grid-flow-col md:auto-cols-fr"
          }`}
          style={{ minWidth: movie.scenes.length > 6 ? `${movie.scenes.length * 105}px` : "100%" }}
        >
          {movie.scenes.map((scene, idx) => {
            const isSelected = activeSceneIndex === idx;
            const offset = sceneOffsets[idx];
            const displayDuration = offset ? Math.round(offset.duration) : 4;

            return (
              <div
                key={`${scene.id || scene.type}-${idx}`}
                onClick={() => offset && handleSeek(offset.start)}
                className={`p-2.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all relative select-none ${
                  movie.scenes.length <= 3 ? "flex-1 min-w-[140px]" : ""
                } ${
                  isSelected
                    ? `${activeTheme.activeCardBg} ${activeTheme.border} shadow-md`
                    : `bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:${activeTheme.border} hover:bg-slate-50 dark:hover:bg-white/[0.08] shadow-sm`
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-bold truncate ${isSelected ? activeTheme.text : "text-slate-900 dark:text-white"}`}>
                    {getSceneLabel(scene.type, idx)}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 shrink-0 ml-1">
                    {displayDuration}s
                  </span>
                </div>

                <div className="h-7 w-full rounded-lg bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/5 flex items-center justify-center p-1 font-mono text-[9px] text-slate-600 dark:text-slate-400 overflow-hidden text-center">
                  {scene.type === "overview" && <span>PR #{movie.pr.number}</span>}
                  {scene.type === "before_after" && <span className={`${activeTheme.text} font-semibold`}>Architecture</span>}
                  {scene.type === "code_changes" && <span className="text-emerald-600 dark:text-emerald-400 font-semibold truncate">{scene.title.split(":")[0]}</span>}
                  {scene.type === "change_breakdown" && <span>Categories</span>}
                  {scene.type === "files_changed" && <span>{movie.scenes.find(s => s.type === "files_changed")?.files?.length || movie.overview.stats.filesChanged} files</span>}
                  {scene.type === "summary" && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" />
                      <span>Evidence</span>
                    </span>
                  )}
                </div>

                {isSelected && (
                  <div className={`w-full h-0.5 rounded-full ${activeTheme.accentBg} mt-1.5`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full p-3 rounded-xl bg-white dark:bg-[#0e121c] border border-slate-200 dark:border-white/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs transition-colors mt-1">
        <div className="flex flex-col gap-0.5 md:w-1/3">
          <label className="text-[10px] uppercase font-mono font-medium text-slate-500 dark:text-slate-400 tracking-wider">
            Movie Title
          </label>
          <input
            id="title-input"
            type="text"
            value={movieTitle}
            onChange={(e) => {
              setMovieTitle(e.target.value);
              setMovie((prev) => ({
                ...prev,
                overview: { ...prev.overview, title: e.target.value },
              }));
            }}
            className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] uppercase font-mono font-medium text-slate-500 dark:text-slate-400 tracking-wider">
            Theme
          </label>
          <div className="flex items-center gap-2 py-0.5">
            {(["purple", "blue", "teal", "amber", "pink"] as AccentTheme[]).map((themeKey) => {
              const t = themeColors[themeKey];
              const isSelected = accentTheme === themeKey;

              return (
                <button
                  key={themeKey}
                  onClick={() => setAccentTheme(themeKey)}
                  style={{ backgroundColor: t.hex }}
                  className={`w-4 h-4 rounded-full transition-transform ${
                    isSelected ? "scale-125 ring-2 ring-indigo-600 dark:ring-white ring-offset-2 ring-offset-white dark:ring-offset-[#0e121c]" : "opacity-80 hover:opacity-100"
                  }`}
                  title={`${themeKey.toUpperCase()} Theme`}
                />
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] uppercase font-mono font-medium text-slate-500 dark:text-slate-400 tracking-wider">
            Duration
          </label>
          <div className="relative">
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(Number(e.target.value))}
              className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-white focus:outline-none pr-7 appearance-none cursor-pointer font-mono"
            >
              {durationOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
