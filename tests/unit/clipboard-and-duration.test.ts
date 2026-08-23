import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { copyToClipboard } from "@/lib/utils";
import { SAMPLE_PR_MOVIE, SHOWCASE_EXAMPLES } from "@/lib/movie/fixture";

describe("Clipboard Copy & Duration Logic", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return false when window is undefined", async () => {
    const originalWindow = global.window;
    // @ts-expect-error test SSR
    delete global.window;
    const result = await copyToClipboard("https://prmovie.dev");
    expect(result).toBe(false);
    global.window = originalWindow;
  });

  it("should successfully copy using navigator.clipboard when available in secure context", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    
    Object.defineProperty(global, "window", {
      value: { isSecureContext: true },
      writable: true,
      configurable: true,
    });

    Object.defineProperty(global, "navigator", {
      value: {
        clipboard: {
          writeText: writeTextMock,
        },
      },
      writable: true,
      configurable: true,
    });

    const result = await copyToClipboard("https://prmovie.dev/vercel/next.js/pull/49258");
    expect(result).toBe(true);
    expect(writeTextMock).toHaveBeenCalledWith("https://prmovie.dev/vercel/next.js/pull/49258");
  });

  it("should fallback to execCommand when navigator.clipboard throws", async () => {
    const writeTextMock = vi.fn().mockRejectedValue(new Error("Permission denied"));
    const execCommandMock = vi.fn().mockReturnValue(true);

    Object.defineProperty(global, "window", {
      value: { isSecureContext: true },
      writable: true,
      configurable: true,
    });

    Object.defineProperty(global, "navigator", {
      value: {
        clipboard: {
          writeText: writeTextMock,
        },
      },
      writable: true,
      configurable: true,
    });

    Object.defineProperty(global, "document", {
      value: {
        createElement: vi.fn().mockReturnValue({
          style: {},
          value: "",
          focus: vi.fn(),
          select: vi.fn(),
          setAttribute: vi.fn(),
          setSelectionRange: vi.fn(),
        }),
        body: {
          appendChild: vi.fn(),
          removeChild: vi.fn(),
        },
        execCommand: execCommandMock,
      },
      writable: true,
      configurable: true,
    });

    const result = await copyToClipboard("https://prmovie.dev/test");
    expect(result).toBe(true);
    expect(execCommandMock).toHaveBeenCalledWith("copy");
  });
});

describe("Duration Logic & Invariant Validation", () => {
  it("should verify SAMPLE_PR_MOVIE totalDuration matches the exact sum of its scene durations", () => {
    const movie = SAMPLE_PR_MOVIE;
    const sceneSum = movie.scenes.reduce((sum, s) => sum + s.duration, 0);
    expect(sceneSum).toBe(26);
    expect(movie.overview.totalDuration).toBe(26);
    expect(movie.overview.totalDuration).toBe(sceneSum);
  });

  it("should verify React 28000 showcase totalDuration matches the exact sum of its scene durations", () => {
    const movie = SHOWCASE_EXAMPLES["facebook/react/28000"];
    const sceneSum = movie.scenes.reduce((sum, s) => sum + s.duration, 0);
    expect(sceneSum).toBe(44);
    expect(movie.overview.totalDuration).toBe(44);
    expect(movie.overview.totalDuration).toBe(sceneSum);
  });

  it("should proportionally scale scene durations and sum to totalDuration exactly", () => {
    const movie = SAMPLE_PR_MOVIE;
    const customTotalDuration = 60; // User chose 60s
    const rawTotal = movie.scenes.reduce((sum, s) => sum + (s.duration || 5), 0) || 1;
    const ratio = customTotalDuration / rawTotal;

    const offsets = movie.scenes.reduce<Array<{ start: number; end: number; duration: number }>>(
      (acc, scene) => {
        const duration = (scene.duration || 5) * ratio;
        const start = acc.length > 0 ? acc[acc.length - 1].end : 0;
        const end = start + duration;
        acc.push({ start, end, duration });
        return acc;
      },
      []
    );

    expect(offsets[0].start).toBe(0);
    expect(offsets[offsets.length - 1].end).toBeCloseTo(60, 5);

    // Sum of segment width weights should equal 100%
    const totalWeight = offsets.reduce(
      (sum, o) => sum + (o.duration / customTotalDuration) * 100,
      0
    );
    expect(totalWeight).toBeCloseTo(100, 5);
  });

  it("should compute logical, progressive duration presets based on scene counts", () => {
    const movie = SAMPLE_PR_MOVIE; // 6 scenes
    const sceneCount = movie.scenes.length;

    const naturalDuration = movie.overview.totalDuration || 26;
    const quickDuration = Math.max(10, Math.round(sceneCount * 2.5)); // 15s
    const standardDuration = Math.max(20, Math.round(sceneCount * 4.5)); // 27s
    const deepDiveDuration = Math.max(30, Math.round(sceneCount * 6.5)); // 39s

    expect(quickDuration).toBe(15);
    expect(standardDuration).toBe(27);
    expect(deepDiveDuration).toBe(39);
    expect(naturalDuration).toBe(26);

    // Ensure durations are in increasing order
    expect(quickDuration).toBeLessThan(standardDuration);
    expect(standardDuration).toBeLessThan(deepDiveDuration);
  });
});
