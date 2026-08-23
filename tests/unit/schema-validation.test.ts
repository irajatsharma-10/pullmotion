import { describe, it, expect } from "vitest";
import { PRMovieSchema } from "@/types/schemas";
import { SAMPLE_PR_MOVIE } from "@/lib/movie/fixture";

describe("PRMovieSchema Validation", () => {
  it("successfully validates the canonical sample PR movie fixture", () => {
    const parseResult = PRMovieSchema.safeParse(SAMPLE_PR_MOVIE);
    expect(parseResult.success).toBe(true);
  });

  it("fails validation when required fields are missing", () => {
    const invalidPayload = {
      version: 1,
      movieId: "test-movie",
      // missing pr, overview, scenes
    };

    const parseResult = PRMovieSchema.safeParse(invalidPayload);
    expect(parseResult.success).toBe(false);
  });

  it("fails validation when an unrecognized scene type is provided", () => {
    const badSceneMovie = {
      ...SAMPLE_PR_MOVIE,
      scenes: [
        {
          id: "invalid-scene",
          type: "performance-impact", // Not a valid V1 scene
          title: "Invalid",
          duration: 5,
        },
      ],
    };

    const parseResult = PRMovieSchema.safeParse(badSceneMovie);
    expect(parseResult.success).toBe(false);
  });
});
