/**
 * @file ThemeProvider.tsx
 * @description Next-themes wrapper providing light/dark theme context across the application.
 */

"use client";

import * as React from "react";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
