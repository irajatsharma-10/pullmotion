"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Search, Film, Calendar, Play, Trash2 } from "lucide-react";
import type { PRMovie } from "@/types/pr-movie";
import {
  getSavedMovies,
  removeSavedMovie,
  type SavedMovieItem,
} from "@/lib/movie/history";

interface MyMoviesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMovie: (movie: PRMovie) => void;
  currentMovie: PRMovie;
}

export function MyMoviesModal({
  isOpen,
  onClose,
  onSelectMovie,
  currentMovie,
}: MyMoviesModalProps) {
  const [search, setSearch] = useState("");
  const [moviesList, setMoviesList] = useState<SavedMovieItem[]>(() => {
    const list = getSavedMovies();
    if (list.length === 0 && currentMovie) {
      return [{ ...currentMovie, savedAt: new Date().toISOString() }];
    }
    return list;
  });

  useEffect(() => {
    if (isOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const updateList = () => {
      const list = getSavedMovies();
      if (list.length === 0 && currentMovie) {
        setMoviesList([{ ...currentMovie, savedAt: new Date().toISOString() }]);
      } else {
        setMoviesList(list);
      }
    };

    updateList();
    window.addEventListener("prmovie_history_updated", updateList);
    return () => window.removeEventListener("prmovie_history_updated", updateList);
  }, [currentMovie]);

  const handleDelete = (e: React.MouseEvent, movieId: string) => {
    e.stopPropagation();
    const updated = removeSavedMovie(movieId);
    setMoviesList(updated);
  };

  const filteredMovies = moviesList.filter((m) =>
    (m.overview?.title || "").toLowerCase().includes(search.toLowerCase()) ||
    (m.pr?.repo || "").toLowerCase().includes(search.toLowerCase()) ||
    (m.pr?.owner || "").toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-2xl bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-colors"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0d14]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-600/10 border border-purple-500/30 text-purple-600 dark:text-purple-400">
                <Film className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">My Generated Movies</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Your recent PR Movie storyboard library</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-[#0a0d14]/50">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, repository, or owner..."
                className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredMovies.length === 0 ? (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs">
                No matching movies found in your library.
              </div>
            ) : (
              filteredMovies.map((movie) => {
                const isSelected = movie.movieId === currentMovie?.movieId;
                const formattedDate = movie.savedAt
                  ? new Date(movie.savedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                  : "Recent";

                return (
                  <div
                    key={movie.movieId}
                    className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 group ${isSelected
                        ? "bg-purple-600/10 border-purple-500/40 shadow-md shadow-purple-500/5"
                        : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-purple-500/30 hover:bg-slate-100 dark:hover:bg-white/[0.07]"
                      }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-mono font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                          {movie.pr?.owner}/{movie.pr?.repo} #{movie.pr?.number}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formattedDate}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {movie.overview?.title || "PR Movie Story"}
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {movie.overview?.summary || ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => handleDelete(e, movie.movieId)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Remove from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          onSelectMovie(movie);
                          onClose();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Watch</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
