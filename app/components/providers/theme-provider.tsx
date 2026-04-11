"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      {...props}
      /* next-themes injects a <script> for FOUC prevention.
         Next.js 16 logs a warning about scripts in components.
         This is expected — not a real error. The script runs fine. */
    >
      {children}
    </NextThemesProvider>
  );
}