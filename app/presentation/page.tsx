"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import {
  TitleSlide,
  TeamSlide,
  ProjectOverviewSlide,
  DemoFeaturesSlide,
  TechStackSlide,
  ArchitectureSlide,
  ConclusionSlide,
} from "@/components/presentation/slides";

const slides = [
  TitleSlide,
  TeamSlide,
  ProjectOverviewSlide,
  DemoFeaturesSlide,
  TechStackSlide,
  ArchitectureSlide,
  ConclusionSlide,
];

const slideLabels = [
  "Title",
  "Team",
  "Overview",
  "Features",
  "Tech Stack",
  "Architecture",
  "Conclusion",
];

export default function PresentationPage() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating || index === current || index < 0 || index >= slides.length) return;
      setDirection(index > current ? "right" : "left");
      setIsAnimating(true);
      setTimeout(() => {
        setCurrent(index);
        setIsAnimating(false);
      }, 200);
    },
    [current, isAnimating]
  );

  const prev = useCallback(() => goTo(current - 1), [current, goTo]);
  const next = useCallback(() => goTo(current + 1), [current, goTo]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [prev, next]);

  const CurrentSlide = slides[current];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="absolute top-4 right-4 z-10">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          Go to App
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
      <div className="flex-1 relative overflow-hidden">
        <div
          className={`transition-opacity duration-200 ${
            isAnimating ? "opacity-0" : "opacity-100"
          }`}
        >
          <CurrentSlide />
        </div>
      </div>

      <div className="sticky bottom-0 bg-card border-t border-border px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={prev}
            disabled={current === 0}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>

          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === current
                    ? "bg-primary w-6"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                title={slideLabels[i]}
              />
            ))}
          </div>

          <button
            onClick={next}
            disabled={current === slides.length - 1}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center mt-1">
          <span className="text-xs text-muted-foreground">
            {current + 1} / {slides.length} — {slideLabels[current]}
          </span>
        </div>
      </div>
    </div>
  );
}
