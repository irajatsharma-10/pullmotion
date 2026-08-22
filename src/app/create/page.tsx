import React from "react";
import type { Metadata } from "next";
import { StudioWorkspace } from "@/components/studio/StudioWorkspace";
import { SAMPLE_PR_MOVIE } from "@/lib/movie/fixture";

export const metadata: Metadata = {
  title: "Create PR Movie & Review Studio",
  description:
    "Generate an animated 6-scene review storyboard from any GitHub pull request. Inspect architecture transitions, diff excerpts, and verified evidence.",
  openGraph: {
    title: "Create PR Movie & Review Studio",
    description:
      "Generate an animated 6-scene review storyboard from any GitHub pull request.",
  },
};

export default function CreateMoviePage() {
  return <StudioWorkspace initialMovie={SAMPLE_PR_MOVIE} />;
}
