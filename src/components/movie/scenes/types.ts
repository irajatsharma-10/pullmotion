/**
 * @file types.ts
 * @description React component prop types for individual movie scenes.
 */

import type { Scene } from "@/types/scenes";

export interface SceneComponentProps<T extends Scene = Scene> {
  scene: T;
  isActive: boolean;
  progress: number; // 0 to 1 within this scene's duration
  onSelectEvidence?: (evidenceId: string) => void;
  prUrl?: string;
}

