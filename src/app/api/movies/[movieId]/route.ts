import { NextResponse } from "next/server";
import { findMovieById } from "@/lib/db/movies";
import { ensureUniqueSceneIds } from "@/lib/movie/scene-utils";

type RouteContext = {
  params: Promise<{ movieId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { movieId } = await context.params;

    if (!movieId) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_ID", message: "Movie ID is required." } },
        { status: 400 }
      );
    }

    const movie = await findMovieById(movieId);

    if (!movie) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Movie not found." } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, movie: ensureUniqueSceneIds(movie) });
  } catch (error) {
    console.error("GET /api/movies/[movieId] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to load movie." } },
      { status: 500 }
    );
  }
}
