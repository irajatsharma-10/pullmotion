import React from "react";
import { themeColors, type AccentTheme } from "@/lib/studio-themes";
import type { SceneOffset } from "@/hooks/useMoviePlayback";

interface StudioSidebarProps {
  accentTheme: AccentTheme;
  handlePlayPause: () => void;
  handleSeek: (time: number) => void;
  sceneOffsets: SceneOffset[];
}

export function StudioSidebar({
  accentTheme,
  handlePlayPause,
  handleSeek,
  sceneOffsets,
}: StudioSidebarProps) {
  const activeTheme = themeColors[accentTheme];

  return (
    <div className="lg:col-span-2 hidden lg:flex flex-col gap-6 pt-2 select-none">
      <div className="flex items-start gap-3 group cursor-pointer" onClick={() => document.getElementById("pr-input")?.focus()}>
        <div className={`w-7 h-7 rounded-full bg-gradient-to-r ${activeTheme.primary} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-md ${activeTheme.glow}`}>
          1
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
            PASTE PR URL
          </h4>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
            Just paste any GitHub PR link. No sign up required.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 group cursor-pointer" onClick={handlePlayPause}>
        <div className={`w-7 h-7 rounded-full bg-gradient-to-r ${activeTheme.primary} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-md ${activeTheme.glow}`}>
          2
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
            AI GENERATED ANIMATION
          </h4>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
            A short animated story that explains what changed and why it matters.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 group cursor-pointer" onClick={() => handleSeek(sceneOffsets[1]?.start || 4)}>
        <div className={`w-7 h-7 rounded-full bg-gradient-to-r ${activeTheme.primary} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-md ${activeTheme.glow}`}>
          3
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
            SCENE TIMELINE
          </h4>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
            Each scene is auto created. You can preview and reorder.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 group cursor-pointer" onClick={() => document.getElementById("title-input")?.focus()}>
        <div className={`w-7 h-7 rounded-full bg-gradient-to-r ${activeTheme.primary} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-md ${activeTheme.glow}`}>
          4
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
            CUSTOMIZE MOVIE
          </h4>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
            Edit title, accent color theme, playback duration, and review scenes.
          </p>
        </div>
      </div>
    </div>
  );
}
