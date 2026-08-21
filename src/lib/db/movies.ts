import { db } from "@/prisma/db";
import type { PRMovie } from "@/types/pr-movie";
import { SAMPLE_PR_MOVIE } from "@/lib/movie/fixture";

export async function findMovieBySourceHash(sourceHash: string): Promise<PRMovie | null> {
  if (!process.env.DATABASE_URL) {
    if (sourceHash === SAMPLE_PR_MOVIE.sourceHash) return SAMPLE_PR_MOVIE;
    return null;
  }

  try {
    const record = await db.orm.public.Movie.first({ sourceHash });
    return record ? (record.data as unknown as PRMovie) : null;
  } catch (error) {
    console.warn("DB query error in findMovieBySourceHash:", error);
    return null;
  }
}

export async function findMovieById(movieId: string): Promise<PRMovie | null> {
  if (movieId === SAMPLE_PR_MOVIE.movieId || movieId === "demo") {
    return SAMPLE_PR_MOVIE;
  }

  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const record = await db.orm.public.Movie.first({ id: movieId });
    return record ? (record.data as unknown as PRMovie) : null;
  } catch (error) {
    console.warn("DB query error in findMovieById:", error);
    return null;
  }
}

export async function findMovieByPR(
  owner: string,
  repo: string,
  pullNumber: number
): Promise<PRMovie | null> {
  if (
    owner.toLowerCase() === SAMPLE_PR_MOVIE.pr.owner.toLowerCase() &&
    repo.toLowerCase() === SAMPLE_PR_MOVIE.pr.repo.toLowerCase() &&
    pullNumber === SAMPLE_PR_MOVIE.pr.number
  ) {
    return SAMPLE_PR_MOVIE;
  }

  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const record = await db.orm.public.Movie.first({ owner, repo, pullNumber });
    return record ? (record.data as unknown as PRMovie) : null;
  } catch (error) {
    console.warn("DB query error in findMovieByPR:", error);
    return null;
  }
}

export async function saveMovie(movie: PRMovie): Promise<void> {
  if (!process.env.DATABASE_URL) {
    return;
  }

  try {
    const existing = await db.orm.public.Movie.first({ sourceHash: movie.sourceHash });
    if (existing) {
      return;
    }

    await db.orm.public.Movie.create({
      id: movie.movieId,
      sourceHash: movie.sourceHash,
      owner: movie.pr.owner,
      repo: movie.pr.repo,
      pullNumber: movie.pr.number,
      title: movie.overview.title,
      author: movie.pr.author,
      data: JSON.parse(JSON.stringify(movie)),
      durationSeconds: movie.overview.totalDuration,
    });
  } catch (error) {
    console.error("Failed to save movie to database:", error);
  }
}
