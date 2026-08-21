import { useState } from "react";
import { toast } from "sonner";
import type { PRMovie } from "@/types/pr-movie";
import { addSavedMovie } from "@/lib/movie/history";
import { ensureUniqueSceneIds } from "@/lib/movie/scene-utils";

import { parseGitHubPRUrl } from "@/lib/movie/url-parser";

interface UseMovieGenerationProps {
  prUrlInput: string;
  setMovie: (movie: PRMovie) => void;
  setMovieTitle: (title: string) => void;
  setSelectedDuration?: (duration: number) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
}

function sanitizeUserErrorMessage(rawMsg?: string): string {
  if (!rawMsg || typeof rawMsg !== "string") {
    return "Unable to generate PR movie at this time. Please try again later.";
  }
  // Strip out any accidental backend JSON, raw status dumps, or API traces
  if (
    rawMsg.includes("{") ||
    rawMsg.includes("v1beta") ||
    rawMsg.includes("ModelService") ||
    rawMsg.includes("stack") ||
    rawMsg.includes("ECONNREFUSED") ||
    rawMsg.includes("fetch failed")
  ) {
    return "Unable to generate PR movie at this time. Please try again later or explore our instant demo movies.";
  }
  return rawMsg;
}

export function useMovieGeneration({
  prUrlInput,
  setMovie,
  setMovieTitle,
  setSelectedDuration,
  setCurrentTime,
  setIsPlaying,
}: UseMovieGenerationProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("PR data fetched successfully");
  const [isSuccessStatus, setIsSuccessStatus] = useState<boolean>(true);

  // BYOK State
  const [apiKey, setApiKey] = useState<string>(() => {
    if (typeof window !== "undefined") return localStorage.getItem("prmovie_api_key") || localStorage.getItem("pullmotion_api_key") || "";
    return "";
  });
  const [modelName, setModelName] = useState<string>(() => {
    if (typeof window !== "undefined") return localStorage.getItem("prmovie_model_name") || localStorage.getItem("pullmotion_model_name") || "gpt-4o";
    return "gpt-4o";
  });

  const handleGenerateMovie = async () => {
    const parseResult = parseGitHubPRUrl(prUrlInput);
    if (!parseResult.isValid) {
      setStatusMessage(parseResult.error);
      setIsSuccessStatus(false);
      return;
    }

    setIsGenerating(true);
    setIsSuccessStatus(true);
    setStatusMessage("Connecting to GitHub API...");

    try {
      setGenerationStep("Analyzing PR metadata, diffs & coverage scenes...");

      const response = await fetch("/api/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: prUrlInput, apiKey, modelName, forceRegenerate: true }),
      });

      const data = await response.json();

      if (data.success && data.movie) {
        const generatedMovie: PRMovie = ensureUniqueSceneIds(data.movie);
        setMovie(generatedMovie);
        addSavedMovie(generatedMovie);
        setMovieTitle(generatedMovie.overview.title);

        if (typeof window !== "undefined") {
          localStorage.setItem("prmovie_last_active_movie", JSON.stringify(generatedMovie));
          const canonicalPrPath = `/${generatedMovie.pr.owner}/${generatedMovie.pr.repo}/pull/${generatedMovie.pr.number}`;
          window.history.replaceState(null, "", canonicalPrPath);
        }

        if (setSelectedDuration && generatedMovie.overview.totalDuration) {
          setSelectedDuration(generatedMovie.overview.totalDuration);
        }
        setCurrentTime(0);
        setIsPlaying(true);
        setStatusMessage(`PR movie generated: ${generatedMovie.scenes.length} coverage scenes (${generatedMovie.overview.totalDuration || 45}s)`);
        setIsSuccessStatus(true);
        toast.success(`PR Movie generated: ${generatedMovie.scenes.length} scenes covering all changes`);
      } else {
        const rawErrorMsg = data.error?.message || "Unable to generate PR movie. Please try again.";
        const cleanMsg = sanitizeUserErrorMessage(rawErrorMsg);
        setStatusMessage(cleanMsg);
        setIsSuccessStatus(false);
        toast.error(cleanMsg);
      }
    } catch (err) {
      console.error("[useMovieGeneration] Generation error:", err);
      const networkMsg = "Network error while generating movie. Please check your internet connection.";
      setStatusMessage(networkMsg);
      setIsSuccessStatus(false);
      toast.error(networkMsg);
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  return {
    isGenerating,
    generationStep,
    statusMessage,
    isSuccessStatus,
    apiKey,
    setApiKey,
    modelName,
    setModelName,
    handleGenerateMovie,
  };
}
