import type { PRMovie } from "@/types/pr-movie";
import type { Scene } from "@/types/scenes";

/**
 * Ensures all scenes in a PR Movie have strictly unique, deterministic IDs.
 * Resolves duplicate IDs (e.g. from LLM defaults or legacy payloads) so React keys never collide.
 */
export function ensureUniqueSceneIds(movie: PRMovie): PRMovie {
  if (!movie || !Array.isArray(movie.scenes)) return movie;

  const seenIds = new Set<string>();
  const sanitizedScenes = movie.scenes.map((scene, idx) => {
    let id = scene.id;

    // Check if id is missing, a duplicate, or a generic placeholder that has been repeated
    if (!id || seenIds.has(id) || id === "scene-code-changes") {
      const typeSlug = (scene.type || "scene").replace(/_/g, "-");
      id = `scene-${idx + 1}-${typeSlug}`;

      let counter = 1;
      while (seenIds.has(id)) {
        id = `scene-${idx + 1}-${typeSlug}-${counter++}`;
      }
    }

    seenIds.add(id);

    return {
      ...scene,
      id,
    } as Scene;
  });

  return {
    ...movie,
    scenes: sanitizedScenes,
  };
}
