export type AccentTheme = "purple" | "blue" | "teal" | "amber" | "pink";

export interface ThemeColorSet {
  primary: string;
  accentBg: string;
  accentBgHover: string;
  border: string;
  text: string;
  textLight: string;
  glow: string;
  ring: string;
  lightBg: string;
  badgeBorder: string;
  activeCardBg: string;
  hex: string;
}

export const themeColors: Record<AccentTheme, ThemeColorSet> = {
  purple: {
    primary: "from-purple-600 to-indigo-600",
    accentBg: "bg-purple-600",
    accentBgHover: "hover:bg-purple-500",
    border: "border-purple-500/40",
    text: "text-purple-600 dark:text-purple-400",
    textLight: "text-purple-300",
    glow: "shadow-purple-500/25",
    ring: "ring-purple-500",
    lightBg: "bg-purple-500/10 dark:bg-purple-500/15",
    badgeBorder: "border-purple-500/30",
    activeCardBg: "bg-purple-50/90 dark:bg-purple-950/40",
    hex: "#9333ea",
  },
  blue: {
    primary: "from-blue-600 to-cyan-600",
    accentBg: "bg-blue-600",
    accentBgHover: "hover:bg-blue-500",
    border: "border-blue-500/40",
    text: "text-blue-600 dark:text-blue-400",
    textLight: "text-blue-300",
    glow: "shadow-blue-500/25",
    ring: "ring-blue-500",
    lightBg: "bg-blue-500/10 dark:bg-blue-500/15",
    badgeBorder: "border-blue-500/30",
    activeCardBg: "bg-blue-50/90 dark:bg-blue-950/40",
    hex: "#2563eb",
  },
  teal: {
    primary: "from-teal-500 to-emerald-600",
    accentBg: "bg-teal-600",
    accentBgHover: "hover:bg-teal-500",
    border: "border-teal-500/40",
    text: "text-teal-600 dark:text-teal-400",
    textLight: "text-teal-300",
    glow: "shadow-teal-500/25",
    ring: "ring-teal-500",
    lightBg: "bg-teal-500/10 dark:bg-teal-500/15",
    badgeBorder: "border-teal-500/30",
    activeCardBg: "bg-teal-50/90 dark:bg-teal-950/40",
    hex: "#0d9488",
  },
  amber: {
    primary: "from-amber-500 to-orange-600",
    accentBg: "bg-amber-600",
    accentBgHover: "hover:bg-amber-500",
    border: "border-amber-500/40",
    text: "text-amber-600 dark:text-amber-400",
    textLight: "text-amber-300",
    glow: "shadow-amber-500/25",
    ring: "ring-amber-500",
    lightBg: "bg-amber-500/10 dark:bg-amber-500/15",
    badgeBorder: "border-amber-500/30",
    activeCardBg: "bg-amber-50/90 dark:bg-amber-950/40",
    hex: "#d97706",
  },
  pink: {
    primary: "from-pink-600 to-rose-600",
    accentBg: "bg-pink-600",
    accentBgHover: "hover:bg-pink-500",
    border: "border-pink-500/40",
    text: "text-pink-600 dark:text-pink-400",
    textLight: "text-pink-300",
    glow: "shadow-pink-500/25",
    ring: "ring-pink-500",
    lightBg: "bg-pink-500/10 dark:bg-pink-500/15",
    badgeBorder: "border-pink-500/30",
    activeCardBg: "bg-pink-50/90 dark:bg-pink-950/40",
    hex: "#db2777",
  },
};
