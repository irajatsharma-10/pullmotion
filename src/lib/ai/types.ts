import type { PRData } from "@/types/pr-data";
import type { SelectedContext } from "@/lib/analysis/context-selector";
import type { PRAnalysis } from "@/lib/analysis/pr-analyzer";
import type { MoviePlan } from "@/lib/analysis/movie-planner";
import type { PRReviewModel } from "@/types/review-model";
import type { PRMovie } from "@/types/pr-movie";

export interface StoryPlannerInput {
  reviewModel: PRReviewModel;
  plan: MoviePlan;
  context: SelectedContext;
  movieId: string;
  sourceHash: string;
  // Optional convenience aliases
  prData?: PRData;
  analysis?: PRAnalysis;
}

export interface StoryPlanner {
  generateMovie(input: StoryPlannerInput): Promise<PRMovie>;
}

