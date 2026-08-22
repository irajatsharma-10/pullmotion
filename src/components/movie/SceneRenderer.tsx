"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import type {
  Scene,
  OverviewSceneData,
  BeforeAfterSceneData,
  CodeChangeSceneData,
  ChangeBreakdownSceneData,
  FilesChangedSceneData,
  SummarySceneData,
} from "@/types/scenes";
import { OverviewScene } from "./scenes/OverviewScene";
import { BeforeAfterScene } from "./scenes/BeforeAfterScene";
import { CodeChangeScene } from "./scenes/CodeChangeScene";
import { ChangeBreakdownScene } from "./scenes/ChangeBreakdownScene";
import { FilesChangedScene } from "./scenes/FilesChangedScene";
import { SummaryScene } from "./scenes/SummaryScene";

interface SceneRendererProps {
  scene: Scene;
  isActive: boolean;
  progress: number;
  onSelectEvidence?: (evidenceId: string) => void;
  prUrl?: string;
}

export function SceneRenderer({
  scene,
  isActive,
  progress,
  onSelectEvidence,
  prUrl,
}: SceneRendererProps) {
  const sceneKey = scene.id || scene.type;

  const renderComponent = () => {
    switch (scene.type) {
      case "overview":
        return (
          <OverviewScene
            scene={scene as OverviewSceneData}
            isActive={isActive}
            progress={progress}
            onSelectEvidence={onSelectEvidence}
            prUrl={prUrl}
          />
        );
      case "before_after":
        return (
          <BeforeAfterScene
            scene={scene as BeforeAfterSceneData}
            isActive={isActive}
            progress={progress}
            onSelectEvidence={onSelectEvidence}
            prUrl={prUrl}
          />
        );
      case "code_changes":
        return (
          <CodeChangeScene
            scene={scene as CodeChangeSceneData}
            isActive={isActive}
            progress={progress}
            onSelectEvidence={onSelectEvidence}
            prUrl={prUrl}
          />
        );
      case "change_breakdown":
        return (
          <ChangeBreakdownScene
            scene={scene as ChangeBreakdownSceneData}
            isActive={isActive}
            progress={progress}
            onSelectEvidence={onSelectEvidence}
            prUrl={prUrl}
          />
        );
      case "files_changed":
        return (
          <FilesChangedScene
            scene={scene as FilesChangedSceneData}
            isActive={isActive}
            progress={progress}
            onSelectEvidence={onSelectEvidence}
            prUrl={prUrl}
          />
        );
      case "summary":
        return (
          <SummaryScene
            scene={scene as SummarySceneData}
            isActive={isActive}
            progress={progress}
            onSelectEvidence={onSelectEvidence}
            prUrl={prUrl}
          />
        );
      default:
        return null;
    }
  };


  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-transparent">
      <AnimatePresence mode="wait">
        <motion.div
          key={sceneKey}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full h-full flex items-center justify-center p-1 sm:p-2"
        >
          {renderComponent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
