import { describe, it, expect } from "vitest";

describe("Theme Toggle Logic", () => {
  it("computes next theme correctly from dark to light and light to dark", () => {
    const getNextTheme = (currentTheme: "dark" | "light" | undefined, resolvedTheme: "dark" | "light" | undefined) => {
      const isDark = resolvedTheme === "dark" || (!resolvedTheme && currentTheme === "dark");
      return isDark ? "light" : "dark";
    };

    expect(getNextTheme("dark", "dark")).toBe("light");
    expect(getNextTheme("light", "light")).toBe("dark");
    expect(getNextTheme("dark", undefined)).toBe("light");
    expect(getNextTheme("light", undefined)).toBe("dark");
    expect(getNextTheme(undefined, "dark")).toBe("light");
    expect(getNextTheme(undefined, "light")).toBe("dark");
  });

  it("handles initial mount fallback gracefully", () => {
    let mounted = false;
    const renderOutput = () => {
      if (!mounted) {
        return { isButtonDisabled: true, label: "Loading theme toggle" };
      }
      return { isButtonDisabled: false, label: "Toggle theme" };
    };

    expect(renderOutput().isButtonDisabled).toBe(true);
    mounted = true;
    expect(renderOutput().isButtonDisabled).toBe(false);
  });
});
