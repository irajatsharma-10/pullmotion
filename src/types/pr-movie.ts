import { Scene } from "./scenes";
import { EvidenceItem } from "./evidence";

export type PRMovie = {
  version: 1;
  movieId: string;
  sourceHash: string;
  pr: {
    url: string;
    owner: string;
    repo: string;
    number: number;
    title: string;
    author: string;
    createdAt: string;
  };
  overview: {
    title: string;
    summary: string;
    totalDuration: number; // in seconds
    stats: {
      additions: number;
      deletions: number;
      filesChanged: number;
      commits: number;
    };
  };
  scenes: Scene[];
  evidence: EvidenceItem[];
  createdAt: string;
};
