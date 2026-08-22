import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findMovieById } from "@/lib/db/movies";
import { StudioWorkspace } from "@/components/studio/StudioWorkspace";
import { SAMPLE_PR_MOVIE } from "@/lib/movie/fixture";

interface CanonicalMoviePageProps {
  params: Promise<{ movieId: string }>;
}

export async function generateMetadata({ params }: CanonicalMoviePageProps): Promise<Metadata> {
  const { movieId } = await params;
  const movie = await findMovieById(movieId);
  const title = movie ? `${movie.overview.title} | PR Movie` : `Movie ${movieId} | PR Movie`;
  const description = movie
    ? movie.overview.summary
    : "Review animated code change storyboards with architectural flow transitions and source evidence.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CanonicalMoviePage({ params }: CanonicalMoviePageProps) {
  const { movieId } = await params;
  let movie = await findMovieById(movieId);

  if (!movie) {
    if (movieId === SAMPLE_PR_MOVIE.movieId || movieId.includes("49258") || movieId.includes("demo")) {
      movie = SAMPLE_PR_MOVIE;
    } else {
      notFound();
    }
  }

  return <StudioWorkspace initialMovie={movie} />;
}
